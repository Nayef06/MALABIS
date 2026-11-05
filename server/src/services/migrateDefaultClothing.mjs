import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { getDefaultClothingRecords } from "../utils/defaultClothing.mjs";
import { legacyDefaultClothingRecords, legacyReplacementNames } from "../utils/legacyDefaultClothing.mjs";

export const DEFAULT_CLOTHING_MIGRATION = "default-clothing-v2";
const { EJSON } = mongoose.mongo.BSON;
const catalogFields = ["name", "type", "color", "imageLink"];
const id = (value) => String(value);
const same = (first, second) => EJSON.stringify(first) === EJSON.stringify(second);
const matches = (item, record) => catalogFields.every((field) => item[field] === record[field]);

export function isLegacyDefault(item) {
  return legacyDefaultClothingRecords.some((record) => matches(item, record));
}

// This plan never identifies an item from its name alone or modifies an upload.
export function planDefaultClothingMigration(user, inventory, outfits) {
  const legacyItems = inventory.filter(isLegacyDefault);
  if (!legacyItems.length) return null;
  if (user.deletingAccount) throw new Error(`Account deletion is in progress for ${user.username}.`);

  const defaults = getDefaultClothingRecords();
  const targets = new Map(defaults.map((record) => [record.name, record]));
  const currentDefaults = new Map();
  for (const item of inventory) {
    const target = defaults.find((record) => matches(item, record));
    if (target && !currentDefaults.has(target.name)) currentDefaults.set(target.name, item);
  }

  const replacements = new Map();
  const updates = new Map();
  for (const item of legacyItems) {
    const targetName = legacyReplacementNames[item.name];
    if (!targetName) {
      replacements.set(id(item._id), null);
      continue;
    }
    const target = targets.get(targetName);
    assert.ok(target, `Missing replacement for ${item.name}.`);
    const existing = currentDefaults.get(targetName);
    if (existing) {
      replacements.set(id(item._id), existing._id);
      if (item.isFavorited && !existing.isFavorited) {
        const update = updates.get(id(existing._id)) || { before: existing, after: { ...existing } };
        update.after.isFavorited = true;
        updates.set(id(existing._id), update);
      }
    } else {
      const after = { ...item, ...target, isFavorited: item.isFavorited ?? false };
      updates.set(id(item._id), { before: item, after });
      currentDefaults.set(targetName, after);
      replacements.set(id(item._id), item._id);
    }
  }

  const insertions = defaults.filter((record) => !currentDefaults.has(record.name))
    .map((record) => ({ _id: new mongoose.Types.ObjectId(), ...record, __v: 0 }));
  const defaultIds = new Set([...currentDefaults.values(), ...insertions].map((item) => id(item._id)));
  const replaceIds = (values) => {
    const seenDefaults = new Set();
    return values.flatMap((value) => {
      const next = replacements.has(id(value)) ? replacements.get(id(value)) : value;
      if (!next) return [];
      if (defaultIds.has(id(next))) {
        if (seenDefaults.has(id(next))) return [];
        seenDefaults.add(id(next));
      }
      return [next];
    });
  };
  const inventoryAfter = [...replaceIds(user.inventory), ...insertions.map((item) => item._id)];
  const outfitUpdates = outfits.flatMap((outfit) => {
    const clothingItems = replaceIds(outfit.clothingItems);
    return same(clothingItems, outfit.clothingItems) ? [] : [{ before: outfit, clothingItems }];
  });

  return {
    userBefore: Object.fromEntries(["_id", "username", "inventory", "outfits", "uploadedImageIds", "deletingAccount"]
      .filter((field) => Object.hasOwn(user, field)).map((field) => [field, user[field]])),
    legacyItems,
    preservedItems: inventory.filter((item) => !isLegacyDefault(item) && !defaults.some((record) => matches(item, record))),
    inventoryAfter,
    itemUpdates: [...updates.values()],
    insertions,
    outfitUpdates,
    summary: {
      username: user.username,
      legacyDefaults: legacyItems.length,
      updatedItems: updates.size,
      addedDefaults: insertions.length,
      removedFromWardrobe: user.inventory.length + insertions.length - inventoryAfter.length,
      preservedOtherPieces: inventory.filter((item) => !isLegacyDefault(item)).length,
      outfitsUpdated: outfitUpdates.length,
      finalInventoryCount: inventoryAfter.length,
    },
  };
}

export async function readDefaultClothingPlan(db, user) {
  const [inventory, outfits] = await Promise.all([
    db.collection("clothingitems").find({ _id: { $in: user.inventory } }).toArray(),
    db.collection("outfits").find({ _id: { $in: user.outfits || [] } }).toArray(),
  ]);
  assert.equal(inventory.length, new Set(user.inventory.map(id)).size, `Missing inventory records for ${user.username}; review before migration.`);
  return planDefaultClothingMigration(user, inventory, outfits);
}

export async function verifyDefaultClothingMigration(db, plan) {
  const user = await db.collection("users").findOne({ _id: plan.userBefore._id });
  assert.ok(same(user.inventory, plan.inventoryAfter), "Inventory changed during migration; inspect the backup before continuing.");
  assert.ok(same(user.uploadedImageIds, plan.userBefore.uploadedImageIds), "Uploaded image tracking changed during migration.");
  assert.ok(same(user.outfits, plan.userBefore.outfits), "The account's saved outfit IDs changed during migration.");
  for (const original of plan.preservedItems) {
    assert.ok(user.inventory.some((value) => id(value) === id(original._id)), "An uploaded piece is missing from the account.");
    const current = await db.collection("clothingitems").findOne({ _id: original._id });
    assert.ok(same(current, original), `Uploaded piece ${original._id} changed.`);
  }
  const inventory = await db.collection("clothingitems").find({ _id: { $in: user.inventory } }).toArray();
  assert.ok(!inventory.some(isLegacyDefault), "Legacy defaults remain in the wardrobe.");
  for (const target of getDefaultClothingRecords()) {
    assert.ok(inventory.some((item) => matches(item, target)), `Missing new default: ${target.name}.`);
  }
  for (const update of plan.outfitUpdates) {
    const current = await db.collection("outfits").findOne({ _id: update.before._id });
    assert.ok(same(current, { ...update.before, clothingItems: update.clothingItems }), "A saved outfit changed unexpectedly.");
  }
}

export async function migrateDefaultClothingForUser(db, user, { apply = false, backupDirectory } = {}) {
  const journal = db.collection("defaultclothingmigrations");
  const migrationId = `${DEFAULT_CLOTHING_MIGRATION}-${user._id}`;
  const existing = await journal.findOne({ _id: migrationId });
  if (existing?.status === "applied") return { username: user.username, status: "already-applied" };
  const plan = existing?.plan || await readDefaultClothingPlan(db, user);
  if (!plan) return { username: user.username, status: "no-legacy-defaults" };
  if (!apply) return { ...plan.summary, status: existing ? "pending-resume" : "dry-run" };
  assert.ok(backupDirectory, "A backup directory is required when applying the migration.");

  // Defaults were originally per-account records. Refuse unexpected shared ownership.
  const legacyIds = plan.legacyItems.map((item) => item._id);
  const [otherOwner, otherOutfit] = await Promise.all([
    db.collection("users").findOne({ _id: { $ne: user._id }, inventory: { $in: legacyIds } }, { projection: { _id: 1 } }),
    db.collection("outfits").findOne({ _id: { $nin: plan.userBefore.outfits || [] }, clothingItems: { $in: legacyIds } }, { projection: { _id: 1 } }),
  ]);
  assert.ok(!otherOwner && !otherOutfit, "Legacy records are shared with another account or outfit; manual review is required.");

  const record = existing || { _id: migrationId, username: user.username, userId: user._id, createdAt: new Date(), status: "pending", plan };
  const backupPath = path.join(backupDirectory, `${migrationId}.json`);
  await mkdir(backupDirectory, { recursive: true });
  const backup = EJSON.stringify({ ...record, status: "pending" }, null, 2, { relaxed: false });
  try {
    await writeFile(backupPath, backup, { flag: "wx", mode: 0o600 });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const savedBackup = EJSON.parse(await readFile(backupPath, "utf8"));
    assert.ok(same(savedBackup.plan, plan), "An existing backup has a different plan; refusing to overwrite it.");
  }
  if (!existing) await journal.insertOne(record);

  // Each write compares its original data and accepts an already-completed write
  // on resume. This also works on standalone local MongoDB without transactions.
  const items = db.collection("clothingitems");
  for (const item of plan.insertions) {
    const current = await items.findOne({ _id: item._id });
    if (!current) await items.insertOne(item);
    else assert.ok(same(current, item), "A newly inserted default changed before migration resumed.");
  }
  for (const update of plan.itemUpdates) {
    const fields = Object.fromEntries(Object.entries(update.after).filter(([key, value]) => key !== "_id" && !same(value, update.before[key])));
    const result = await items.updateOne(update.before, { $set: fields });
    if (!result.matchedCount) {
      assert.ok(same(await items.findOne({ _id: update.before._id }), update.after), "A default was edited during migration; refusing to overwrite the edit.");
    }
  }
  for (const update of plan.outfitUpdates) {
    const result = await db.collection("outfits").updateOne(
      { _id: update.before._id, clothingItems: update.before.clothingItems },
      { $set: { clothingItems: update.clothingItems } },
    );
    if (!result.matchedCount) {
      const current = await db.collection("outfits").findOne({ _id: update.before._id });
      assert.ok(current && same(current.clothingItems, update.clothingItems), "An outfit was edited during migration; refusing to overwrite the edit.");
    }
  }
  const result = await db.collection("users").updateOne(
    { _id: user._id, inventory: plan.userBefore.inventory, deletingAccount: { $ne: true } },
    { $set: { inventory: plan.inventoryAfter } },
  );
  if (!result.matchedCount) {
    const current = await db.collection("users").findOne({ _id: user._id });
    assert.ok(current && !current.deletingAccount && same(current.inventory, plan.inventoryAfter), "Inventory was edited during migration; refusing to overwrite the edit.");
  }
  await verifyDefaultClothingMigration(db, plan);
  await journal.updateOne({ _id: migrationId }, { $set: { status: "applied", appliedAt: new Date() } });
  // Unlinked legacy documents remain recoverable; no images or clothing are deleted.
  return { ...plan.summary, status: "applied", backupPath };
}
