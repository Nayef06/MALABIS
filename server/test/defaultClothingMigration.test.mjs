import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import mongoose from "mongoose";
import { getDefaultClothingRecords } from "../src/utils/defaultClothing.mjs";
import { legacyDefaultClothingRecords } from "../src/utils/legacyDefaultClothing.mjs";
import { DEFAULT_CLOTHING_MIGRATION, migrateDefaultClothingForUser, isLegacyDefault, planDefaultClothingMigration } from "../src/services/migrateDefaultClothing.mjs";

function migrationFixture() {
  const legacy = legacyDefaultClothingRecords.slice(0, 18).map((item) => ({ _id: new mongoose.Types.ObjectId(), ...item, isFavorited: item.name === "BASIC T", __v: 0 }));
  // An upload deliberately uses the same name, color, and type as a seed item.
  const upload = { _id: new mongoose.Types.ObjectId(), name: "JEANS", color: "blue", type: "pants", imageLink: "https://res.cloudinary.com/test/image/upload/my-jeans.png", isFavorited: true, __v: 0 };
  const inventory = [...legacy, upload];
  const outfits = [{
    _id: new mongoose.Types.ObjectId(), name: "Keep this look", isFavorited: true, __v: 0,
    clothingItems: [legacy.find((item) => item.name === "BASIC T")._id, legacy[0]._id, upload._id, legacy.at(-1)._id],
  }];
  const user = { _id: new mongoose.Types.ObjectId(), username: "migration-fixture", password: "fixture-hash-excluded-from-backup", inventory: inventory.map((item) => item._id), outfits: outfits.map((outfit) => outfit._id), uploadedImageIds: ["test/my-jeans"], deletingAccount: false };
  return { user, inventory, outfits, legacy, upload };
}

test("migration matches exact legacy metadata and preserves uploads with default names", () => {
  const fixture = migrationFixture();
  assert.equal(isLegacyDefault(fixture.legacy[0]), true);
  for (const field of ["name", "type", "color", "imageLink"]) {
    assert.equal(isLegacyDefault({ ...fixture.legacy[0], [field]: "changed" }), false);
  }
  assert.equal(isLegacyDefault(fixture.upload), false);
  const original = JSON.stringify(fixture);
  const plan = planDefaultClothingMigration(fixture.user, fixture.inventory, fixture.outfits);
  assert.equal(JSON.stringify(fixture), original, "Planning must not mutate input data.");
  assert.equal(plan.summary.legacyDefaults, 18);
  assert.equal(plan.summary.updatedItems, 14);
  assert.equal(plan.summary.removedFromWardrobe, 4);
  assert.equal(plan.summary.finalInventoryCount, 15);
  assert.deepEqual(plan.preservedItems, [fixture.upload]);
  assert.equal(plan.insertions.length, 0);
  assert.ok(plan.inventoryAfter.some((value) => value.equals(fixture.upload._id)));
  const tee = plan.itemUpdates.find((update) => update.after.name === "Black Oversized");
  assert.equal(tee.after.isFavorited, true);
  assert.ok(tee.after._id.equals(tee.before._id), "Replacement defaults keep their IDs.");
  assert.deepEqual(plan.outfitUpdates[0].clothingItems, [tee.before._id, fixture.upload._id]);
});

test("migration fills missing defaults and reuses existing new defaults without duplication", () => {
  const fixture = migrationFixture();
  const basic = fixture.legacy.find((item) => item.name === "BASIC T");
  const current = { _id: new mongoose.Types.ObjectId(), ...getDefaultClothingRecords().find((item) => item.name === "Black Oversized"), __v: 0 };
  const inventory = [basic, current, fixture.upload];
  const outfit = { ...fixture.outfits[0], clothingItems: [basic._id, current._id, fixture.upload._id] };
  const plan = planDefaultClothingMigration({ ...fixture.user, inventory: inventory.map((item) => item._id) }, inventory, [outfit]);
  assert.equal(plan.insertions.length, 13);
  assert.equal(plan.inventoryAfter.length, 15);
  assert.equal(plan.inventoryAfter.filter((value) => value.equals(current._id)).length, 1);
  assert.ok(!plan.inventoryAfter.some((value) => value.equals(basic._id)));
  assert.deepEqual(plan.outfitUpdates[0].clothingItems, [current._id, fixture.upload._id]);
  assert.equal(plan.itemUpdates[0].after.isFavorited, true);
});

test("migration leaves accounts without known legacy defaults untouched", () => {
  const fixture = migrationFixture();
  assert.equal(planDefaultClothingMigration({ ...fixture.user, inventory: [fixture.upload._id] }, [fixture.upload], []), null);
  const defaults = getDefaultClothingRecords().map((item) => ({ _id: new mongoose.Types.ObjectId(), ...item }));
  assert.equal(planDefaultClothingMigration({ ...fixture.user, inventory: defaults.map((item) => item._id) }, defaults, []), null);
  assert.throws(() => planDefaultClothingMigration({ ...fixture.user, deletingAccount: true }, fixture.inventory, []), /deletion is in progress/);
});

test("migration recognizes historical cap and jeans URLs without matching uploads", () => {
  const fixture = migrationFixture();
  const historical = legacyDefaultClothingRecords.slice(18).map((item) => ({ _id: new mongoose.Types.ObjectId(), ...item, isFavorited: false }));
  assert.equal(historical.length, 2);
  assert.ok(historical.every(isLegacyDefault));
  const inventory = [...historical, fixture.upload];
  const plan = planDefaultClothingMigration({ ...fixture.user, inventory: inventory.map((item) => item._id), outfits: [] }, inventory, []);
  assert.equal(plan.summary.legacyDefaults, 2);
  assert.equal(plan.itemUpdates[0].after.name, "Dark Baggy Jeans");
  assert.equal(plan.insertions.length, 13);
  assert.equal(plan.inventoryAfter.length, 15);
  assert.deepEqual(plan.preservedItems, [fixture.upload]);
});

const uri = process.env.MIGRATION_TEST_MONGODB_URI;

test("MongoDB migration preserves uploads and other accounts, resumes failures, and is idempotent", { skip: !uri }, async () => {
  assert.match(uri, /^mongodb:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?\//, "Integration tests require local MongoDB.");
  const databaseName = `malabis_migration_test_${process.pid}_${Date.now()}`;
  const connection = await mongoose.createConnection(uri, { dbName: databaseName, autoIndex: false, autoCreate: false }).asPromise();
  const backupDirectory = await mkdtemp(path.join(os.tmpdir(), "malabis-migration-test-"));
  const db = connection.db;
  try {
    const first = migrationFixture();
    const second = migrationFixture();
    second.user.username = "another-user";
    await db.collection("users").insertMany([first.user, second.user]);
    await db.collection("clothingitems").insertMany([...first.inventory, ...second.inventory]);
    await db.collection("outfits").insertMany([...first.outfits, ...second.outfits]);
    const beforeUpload = await db.collection("clothingitems").findOne({ _id: first.upload._id });
    const beforeOtherUser = await db.collection("users").findOne({ _id: second.user._id });
    const beforeOtherItems = await db.collection("clothingitems").find({ _id: { $in: second.user.inventory } }).toArray();

    const dryRun = await migrateDefaultClothingForUser(db, first.user);
    assert.equal(dryRun.status, "dry-run");
    assert.equal(await db.collection("defaultclothingmigrations").countDocuments(), 0);
    assert.deepEqual(await db.collection("clothingitems").findOne({ _id: first.upload._id }), beforeUpload);

    let itemUpdates = 0;
    const interruptedDb = { collection(name) {
      const collection = db.collection(name);
      if (name !== "clothingitems") return collection;
      return new Proxy(collection, { get(target, property) {
        if (property === "updateOne") return async (...args) => {
          itemUpdates += 1;
          if (itemUpdates === 2) throw new Error("Simulated interrupted migration");
          return target.updateOne(...args);
        };
        const value = target[property];
        return typeof value === "function" ? value.bind(target) : value;
      } });
    } };
    await assert.rejects(migrateDefaultClothingForUser(interruptedDb, first.user, { apply: true, backupDirectory }), /Simulated interrupted/);
    const pending = await db.collection("defaultclothingmigrations").findOne({ userId: first.user._id });
    assert.equal(pending.status, "pending");

    const result = await migrateDefaultClothingForUser(db, first.user, { apply: true, backupDirectory });
    assert.equal(result.status, "applied");
    assert.equal(result.finalInventoryCount, 15);
    const backup = JSON.parse(await readFile(result.backupPath, "utf8"));
    assert.equal(backup.plan.legacyItems.length, 18);
    assert.equal(Object.hasOwn(backup.plan.userBefore, "password"), false);
    const user = await db.collection("users").findOne({ _id: first.user._id });
    const inventory = await db.collection("clothingitems").find({ _id: { $in: user.inventory } }).toArray();
    assert.equal(inventory.length, 15);
    assert.ok(!inventory.some(isLegacyDefault));
    assert.deepEqual(await db.collection("clothingitems").findOne({ _id: first.upload._id }), beforeUpload);
    assert.deepEqual(await db.collection("users").findOne({ _id: second.user._id }), beforeOtherUser);
    assert.deepEqual(await db.collection("clothingitems").find({ _id: { $in: second.user.inventory } }).toArray(), beforeOtherItems);
    // Nothing is deleted, including unlinked old defaults and their images.
    assert.equal(await db.collection("clothingitems").countDocuments(), 38);
    const repeated = await migrateDefaultClothingForUser(db, user, { apply: true, backupDirectory });
    assert.equal(repeated.status, "already-applied");
    assert.equal(await db.collection("clothingitems").countDocuments(), 38);

    // A bulk run can use the same function and includes already migrated users.
    for await (const account of db.collection("users").find()) {
      await migrateDefaultClothingForUser(db, account, { apply: true, backupDirectory });
    }
    assert.equal(await db.collection("defaultclothingmigrations").countDocuments({ status: "applied" }), 2);
    assert.equal((await db.collection("defaultclothingmigrations").findOne({ _id: `${DEFAULT_CLOTHING_MIGRATION}-${first.user._id}` })).status, "applied");
  } finally {
    assert.equal(db.databaseName, databaseName);
    assert.ok(databaseName.startsWith("malabis_migration_test_"));
    await db.dropDatabase();
    await connection.close();
    const resolvedBackupDirectory = await realpath(backupDirectory);
    const resolvedTempRoot = await realpath(os.tmpdir());
    assert.ok(resolvedBackupDirectory.startsWith(resolvedTempRoot + path.sep));
    await rm(resolvedBackupDirectory, { recursive: true });
  }
});
