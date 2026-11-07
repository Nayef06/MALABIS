import assert from "node:assert/strict";
import { once } from "node:events";
import { readdir } from "node:fs/promises";
import test, { after, before } from "node:test";
import { defaultClothingItems } from "../src/utils/defaultClothing.mjs";
import { defaultClothingItems as previewClothingItems } from "../../client/src/starterClothing.mjs";

process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "malabis-test-session-secret";

const [
  { default: app },
  { User },
  { ClothingItem },
  { Outfit },
  { comparePassword, hashPassword },
  { generateOutfit },
  { default: cloudinary, uploadToCloudinary },
  redis,
] = await Promise.all([
  import("../src/index.mjs"),
  import("../src/models/user.mjs"),
  import("../src/models/clothingItem.mjs"),
  import("../src/models/outfit.mjs"),
  import("../src/utils/helpers.mjs"),
  import("../src/routes/generator.mjs"),
  import("../src/utils/cloudinary.mjs"),
  import("../src/utils/redis.mjs"),
]);

const users = new Map();
const clothingItems = new Map();
const outfits = new Map();
const restorations = [];
let server;
let baseUrl;

function replace(target, property, replacement) {
  restorations.push([target, property, target[property]]);
  target[property] = replacement;
}

function asId(value) {
  return String(value?._id ?? value);
}

function includesId(values, value) {
  const targetId = asId(value);
  return values.some((entry) => asId(entry) === targetId);
}

function plain(document) {
  return document?.toObject ? document.toObject() : document;
}

function populatedUser(document, populate) {
  if (!document) return null;

  const result = plain(document);
  if (populate === "inventory") {
    result.inventory = document.inventory
      .map((id) => clothingItems.get(asId(id)))
      .filter(Boolean)
      .map(plain);
  }

  if (populate?.path === "outfits") {
    result.outfits = document.outfits
      .map((id) => outfits.get(asId(id)))
      .filter(Boolean)
      .map((outfit) => ({
        ...plain(outfit),
        clothingItems: outfit.clothingItems
          .map((id) => clothingItems.get(asId(id)))
          .filter(Boolean)
          .map(plain),
      }));
  }

  return result;
}

class FakeQuery {
  constructor(getValue) {
    this.getValue = getValue;
    this.populateValue = null;
  }

  populate(value) {
    this.populateValue = value;
    return this;
  }

  select() {
    return this;
  }

  lean() {
    const value = this.getValue();
    if (Array.isArray(value)) {
      return Promise.resolve(
        value.map((entry) => populatedUser(entry, this.populateValue)),
      );
    }
    return Promise.resolve(populatedUser(value, this.populateValue));
  }

  then(resolve, reject) {
    return Promise.resolve(this.getValue()).then(resolve, reject);
  }
}

function applyUserUpdate(user, update) {
  if (update.$push?.inventory) user.inventory.push(update.$push.inventory);
  if (update.$push?.outfits) user.outfits.push(update.$push.outfits);
  if (update.$addToSet?.uploadedImageIds && !user.uploadedImageIds.includes(update.$addToSet.uploadedImageIds)) {
    user.uploadedImageIds.push(update.$addToSet.uploadedImageIds);
  }
  if (update.$pull?.uploadedImageIds) {
    user.uploadedImageIds = user.uploadedImageIds.filter(
      (id) => id !== update.$pull.uploadedImageIds,
    );
  }
  if (update.$pull?.inventory) {
    user.inventory = user.inventory.filter(
      (id) => asId(id) !== asId(update.$pull.inventory),
    );
  }
  if (update.$pull?.outfits) {
    user.outfits = user.outfits.filter(
      (id) => asId(id) !== asId(update.$pull.outfits),
    );
  }

  const directUpdate = Object.fromEntries(
    Object.entries(update).filter(([key]) => !key.startsWith("$")),
  );
  user.set({ ...update.$set, ...directUpdate });
}

function installModelDoubles() {
  replace(User.prototype, "save", async function saveUser() {
    users.set(asId(this), this);
    return this;
  });
  replace(User, "findById", (id) => (
    new FakeQuery(() => users.get(asId(id)) ?? null)
  ));
  replace(User, "findOne", (query) => new FakeQuery(() => {
    if (query.username !== undefined) {
      return [...users.values()].find(
        (user) => user.username === query.username,
      ) ?? null;
    }
    return [...users.values()].find((user) => (
      (!query._id || asId(user) === asId(query._id))
      && (!query.inventory || includesId(user.inventory, query.inventory))
      && (!query.outfits || includesId(user.outfits, query.outfits))
    )) ?? null;
  }));
  replace(User, "exists", async (query) => {
    const user = users.get(asId(query._id));
    if (!user) return null;
    if (query.inventory && !includesId(user.inventory, query.inventory)) return null;
    if (query.outfits && !includesId(user.outfits, query.outfits)) return null;
    return { _id: user._id };
  });
  replace(User, "findByIdAndUpdate", async (id, update) => {
    const user = users.get(asId(id));
    if (!user) return null;
    applyUserUpdate(user, update);
    users.set(asId(user), user);
    return user;
  });
  replace(User, "findByIdAndDelete", async (id) => {
    const user = users.get(asId(id)) ?? null;
    users.delete(asId(id));
    return user;
  });
  replace(User, "findOneAndUpdate", async (query, update) => {
    const user = users.get(asId(query._id));
    if (!user) return null;
    if (query.deletingAccount?.$ne === true && user.deletingAccount) return null;
    if (query.$or && user.deletingAccount
      && !(user.deletionStartedAt < query.$or[1].deletionStartedAt.$lt)) return null;
    if (query.inventory && !includesId(user.inventory, query.inventory)) return null;
    if (query.outfits && !includesId(user.outfits, query.outfits)) return null;
    applyUserUpdate(user, update);
    users.set(asId(user), user);
    return user;
  });
  replace(ClothingItem.prototype, "save", async function saveClothingItem() {
    clothingItems.set(asId(this), this);
    return this;
  });
  replace(ClothingItem, "insertMany", async (items) => {
    const documents = items.map((item) => new ClothingItem(item));
    for (const document of documents) {
      clothingItems.set(asId(document), document);
    }
    return documents;
  });
  replace(ClothingItem, "findById", async (id) => (
    clothingItems.get(asId(id)) ?? null
  ));
  replace(ClothingItem, "findByIdAndDelete", async (id) => {
    const item = clothingItems.get(asId(id)) ?? null;
    clothingItems.delete(asId(id));
    return item;
  });
  replace(ClothingItem, "deleteMany", async (query) => {
    const matchingIds = new Set((query._id?.$in ?? []).map(asId));
    let deletedCount = 0;
    for (const id of matchingIds) {
      if (clothingItems.delete(id)) deletedCount += 1;
    }
    return { deletedCount };
  });

  replace(Outfit.prototype, "save", async function saveOutfit() {
    outfits.set(asId(this), this);
    return this;
  });
  replace(Outfit, "findById", async (id) => outfits.get(asId(id)) ?? null);
  replace(Outfit, "findByIdAndDelete", async (id) => {
    const outfit = outfits.get(asId(id)) ?? null;
    outfits.delete(asId(id));
    return outfit;
  });
  replace(Outfit, "deleteMany", async (query) => {
    const matchingIds = new Set((query._id?.$in ?? []).map(asId));
    let deletedCount = 0;
    for (const id of matchingIds) {
      if (outfits.delete(id)) deletedCount += 1;
    }
    return { deletedCount };
  });
  replace(Outfit, "updateMany", async (query, update) => {
    const matchingIds = new Set((query._id?.$in ?? []).map(asId));
    let modifiedCount = 0;
    for (const outfit of outfits.values()) {
      if (!matchingIds.has(asId(outfit))) continue;
      if (update.$pull?.clothingItems) {
        outfit.clothingItems = outfit.clothingItems.filter(
          (id) => asId(id) !== asId(update.$pull.clothingItems),
        );
        modifiedCount += 1;
      }
    }
    return { modifiedCount };
  });
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  let body = options.body;
  if (options.json !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(options.json);
  }
  if (options.cookie) headers.set("cookie", options.cookie);

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });
  const contentType = response.headers.get("content-type") ?? "";
  const data = response.status === 204
    ? null
    : contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  const setCookie = response.headers.get("set-cookie");

  return {
    data,
    headers: response.headers,
    status: response.status,
    cookie: setCookie?.split(";", 1)[0],
  };
}

async function signUp(username, displayName = "Test User") {
  return request("/api/auth/signup", {
    method: "POST",
    json: { username, displayName, password: "password123" },
  });
}

async function logIn(username, password = "password123") {
  return request("/api/auth/login", {
    method: "POST",
    json: { username, password },
  });
}

before(async () => {
  installModelDoubles();
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  for (const [target, property, original] of restorations.reverse()) {
    target[property] = original;
  }
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
});

test("password helpers hash and verify asynchronously", async () => {
  const password = "a-secure-password";
  const hashing = hashPassword(password);
  assert.equal(typeof hashing.then, "function");
  const hash = await hashing;

  assert.notEqual(hash, password);
  const comparison = comparePassword(password, hash);
  assert.equal(typeof comparison.then, "function");
  assert.equal(await comparison, true);
  assert.equal(await comparePassword("wrong-password", hash), false);
});

test("models enforce wardrobe data constraints", async () => {
  await assert.rejects(
    new ClothingItem({
      type: "cape",
      color: "black",
      name: "Invalid type",
      imageLink: "https://example.com/item.png",
    }).validate(),
    /not a valid enum value/,
  );

  await assert.rejects(
    new ClothingItem({
      type: "shirt",
      color: "pink",
      name: "Invalid color",
      imageLink: "https://example.com/item.png",
    }).validate(),
    /not a valid enum value/,
  );

  await assert.rejects(new Outfit({ clothingItems: [] }).validate(), /required/);
});

test("signup and preview catalogs include exactly the shipped default clothing", async () => {
  assert.deepEqual(defaultClothingItems, previewClothingItems);
  const assetPrefix = "/images/default-clothing/";
  const items = Object.values(defaultClothingItems).flat();
  assert.equal(items.length, 14);
  assert.equal(new Set(items.map((item) => item.name)).size, 14);
  assert.ok(items.every((item) => item.image.startsWith(assetPrefix)));

  const assetFiles = await readdir(
    new URL("../../client/public/images/default-clothing/", import.meta.url),
    { recursive: true },
  );
  assert.deepEqual(
    items.map((item) => decodeURIComponent(item.image.slice(assetPrefix.length))).sort(),
    assetFiles.filter((file) => file.endsWith(".png")).map((file) => file.replaceAll("\\", "/")).sort(),
  );
});

test("outfit generation is deterministic, honors locks, and reports gaps", () => {
  const inventory = [
    { _id: "shirt-1", type: "shirt" },
    { _id: "shirt-2", type: "shirt" },
    { _id: "pants-1", type: "pants" },
    { _id: "accessory-1", type: "accessory" },
    { _id: "accessory-2", type: "accessory" },
  ];
  const result = generateOutfit(inventory, {
    selectedTypes: ["shirt", "pants", "shoes"],
    lockedItems: ["shirt-2", "accessory-2"],
    accessoryCount: 2,
  }, () => 0);

  assert.deepEqual(result.outfit.map((item) => item._id), [
    "shirt-2",
    "pants-1",
    "accessory-2",
    "accessory-1",
  ]);
  assert.deepEqual(result.missingTypes, ["shoes"]);
  assert.equal(result.success, true);

  assert.deepEqual(generateOutfit([], {
    selectedTypes: ["shirt"],
  }), {
    outfit: [],
    missingTypes: ["shirt"],
    success: false,
  });
});

test("generation fills the requested accessory count without duplicates", () => {
  const inventory = Array.from({ length: 6 }, (_, index) => ({
    _id: `accessory-${index}`,
    type: "accessory",
  }));
  const originalInventory = structuredClone(inventory);

  for (let count = 0; count <= 5; count += 1) {
    for (const lockedItems of [[], ["accessory-5"], inventory.map(asId)]) {
      const { outfit } = generateOutfit(inventory, {
        selectedTypes: [], lockedItems, accessoryCount: count,
      }, () => 0);
      assert.equal(outfit.length, count);
      assert.equal(new Set(outfit.map(asId)).size, count);
      if (count > 0 && lockedItems.length === 1) {
        assert.ok(outfit.some((item) => item._id === "accessory-5"));
      }
    }
  }

  const { outfit } = generateOutfit(inventory.slice(0, 2), {
    selectedTypes: [], accessoryCount: 5,
  });
  assert.equal(outfit.length, 2);
  assert.deepEqual(inventory, originalInventory);
});

test("new passwords respect bcrypt's byte limit and validation omits submitted values", async () => {
  users.clear();
  clothingItems.clear();
  outfits.clear();

  for (const password of [undefined, null, 42, "short", "x".repeat(73), "\u00e9".repeat(37)]) {
    const response = await request("/api/auth/signup", {
      method: "POST",
      json: { username: "password-limits", displayName: "Test User", password },
    });
    assert.equal(response.status, 400);
    assert.ok(response.data.errors.some((error) => error.path === "password"));
    assert.ok(response.data.errors.every((error) => !Object.hasOwn(error, "value")));
    assert.equal(users.size, 0);
  }

  const password = "\u00e9".repeat(36);
  const signup = await request("/api/auth/signup", {
    method: "POST",
    json: { username: "password-limits", displayName: "Test User", password },
  });
  assert.equal(signup.status, 201);
  const login = await logIn("password-limits", password);
  assert.equal(login.status, 200);

  const response = await request("/api/auth/update-profile", {
    method: "POST", cookie: login.cookie, json: { password: `${password}x` },
  });
  assert.equal(response.status, 400);
  assert.ok(response.data.errors.every((error) => !Object.hasOwn(error, "value")));
  assert.equal((await logIn("password-limits", password)).status, 200);

  const update = await request("/api/auth/update-profile", {
    method: "POST", cookie: login.cookie, json: { password: "updated-password" },
  });
  assert.equal(update.status, 200);
  assert.equal((await logIn("password-limits", password)).status, 401);
  assert.equal((await logIn("password-limits", "updated-password")).status, 200);
});

test("saves racing with account deletion leave no new clothing or outfits", async () => {
  users.clear();
  clothingItems.clear();
  outfits.clear();

  assert.equal((await signUp("deleting-owner")).status, 201);
  const cookie = (await logIn("deleting-owner")).cookie;
  const owner = [...users.values()][0];
  const inventoryIds = owner.inventory.map(asId);

  for (const { Model, path, json, store } of [
    {
      Model: ClothingItem, path: "/api/clothing", store: clothingItems,
      json: { name: "Late shirt", type: "shirt", color: "black", imageLink: "https://example.com/shirt.png" },
    },
    {
      Model: Outfit, path: "/api/outfits", store: outfits,
      json: { name: "Late outfit", clothingItems: [inventoryIds[0]] },
    },
  ]) {
    const originalSave = Model.prototype.save;
    const sizeBefore = store.size;
    let saveAttempted = false;
    owner.deletingAccount = false;
    Model.prototype.save = async function saveDuringDeletion() {
      const document = await originalSave.call(this);
      // Deletion acquires its lock after authentication but before ownership is saved.
      owner.deletingAccount = true;
      owner.deletionStartedAt = new Date();
      saveAttempted = true;
      return document;
    };

    try {
      const response = await request(path, { method: "POST", cookie, json });
      assert.equal(saveAttempted, true);
      assert.equal(response.status, 401);
      assert.equal(store.size, sizeBefore);
      assert.deepEqual(owner.inventory.map(asId), inventoryIds);
      assert.equal(owner.outfits.length, 0);
    } finally {
      Model.prototype.save = originalSave;
    }
  }
});

test("utility fallbacks work without optional external services", async () => {
  const originalRedisUrl = process.env.REDIS_URL;
  const originalLog = console.log;
  process.env.REDIS_URL = "";
  console.log = () => {};

  try {
    assert.equal(await redis.initializeRedis(), null);
    assert.equal(redis.redisStatus(), "disabled");
    assert.equal(await redis.getCachedJson("missing"), null);
    await redis.setCachedJson("ignored", { value: true });
    await redis.deleteCachedKeys("ignored");
  } finally {
    console.log = originalLog;
    process.env.REDIS_URL = originalRedisUrl;
  }
});

test("image uploads are normalized before the configured Cloudinary call", async () => {
  const environmentNames = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const originalEnvironment = Object.fromEntries(
    environmentNames.map((name) => [name, process.env[name]]),
  );
  const originalUpload = cloudinary.uploader.upload;
  const originalError = console.error;
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );

  try {
    for (const name of environmentNames) delete process.env[name];
    console.error = () => {};
    let result = await uploadToCloudinary({ buffer: png }, false);
    assert.deepEqual(result, {
      success: false,
      error: "Image upload service is not configured.",
    });

    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
    cloudinary.uploader.upload = async (dataUri, options) => {
      assert.match(dataUri, /^data:image\/png;base64,/);
      assert.equal(options.folder, "malabis-clothing");
      assert.equal(
        options.transformation.some((step) => step.effect === "background_removal"),
        true,
      );
      return {
        secure_url: "https://example.com/upload.png",
        public_id: "malabis-clothing/upload",
      };
    };

    result = await uploadToCloudinary({ buffer: png }, true);
    assert.deepEqual(result, {
      success: true,
      url: "https://example.com/upload.png",
      publicId: "malabis-clothing/upload",
    });

    cloudinary.uploader.upload = async () => {
      throw new Error("upload unavailable");
    };
    result = await uploadToCloudinary({ buffer: png }, false);
    assert.deepEqual(result, { success: false, error: "upload unavailable" });
  } finally {
    console.error = originalError;
    cloudinary.uploader.upload = originalUpload;
    for (const name of environmentNames) {
      if (originalEnvironment[name] === undefined) delete process.env[name];
      else process.env[name] = originalEnvironment[name];
    }
  }
});

test("API workflow covers auth, wardrobe, outfits, generation, and failures", async () => {
  users.clear();
  clothingItems.clear();
  outfits.clear();

  let response = await request("/api/auth/status");
  assert.equal(response.status, 401);
  assert.deepEqual(response.data, { error: "Authentication required." });
  assert.equal(response.headers.get("cache-control"), "private, no-store");

  response = await request("/api/not-a-route", {
    headers: { origin: "https://www.malabis.io" },
  });
  assert.equal(response.status, 404);
  assert.deepEqual(response.data, { error: "Route not found." });
  assert.equal(response.headers.get("access-control-allow-origin"), "https://www.malabis.io");
  assert.equal(response.headers.get("x-powered-by"), null);

  response = await request("/api/not-a-route", {
    headers: { origin: "https://malicious.example" },
  });
  assert.equal(response.headers.get("access-control-allow-origin"), null);

  response = await request("/api/auth/signup", {
    method: "POST",
    json: { username: "short-password", displayName: "Valid Name", password: "short" },
  });
  assert.equal(response.status, 400);
  assert.ok(Array.isArray(response.data.errors));

  response = await signUp(" Alice ", " Alice Doe ");
  assert.equal(response.status, 201);
  assert.equal(users.size, 1);
  assert.equal(clothingItems.size, 14);

  response = await signUp("ALICE");
  assert.equal(response.status, 409);
  assert.deepEqual(response.data, { error: "User already exists." });

  response = await logIn("alice", "wrong-password");
  assert.equal(response.status, 401);

  const login = await logIn(" ALICE ");
  assert.equal(login.status, 200);
  assert.match(login.cookie, /^malabis\.sid=/);
  const aliceCookie = login.cookie;

  response = await request("/api/auth/status", { cookie: aliceCookie });
  assert.equal(response.status, 200);
  assert.equal(response.data.username, "alice");
  assert.equal(response.data.displayName, "Alice Doe");
  assert.equal(response.headers.get("cache-control"), "private, no-store");

  response = await request("/api/auth/update-profile", {
    method: "POST",
    cookie: aliceCookie,
    json: {},
  });
  assert.equal(response.status, 400);

  response = await request("/api/auth/update-profile", {
    method: "POST",
    cookie: aliceCookie,
    json: { displayName: 42 },
  });
  assert.equal(response.status, 400);

  response = await request("/api/auth/update-profile", {
    method: "POST",
    cookie: aliceCookie,
    json: { displayName: " Alice Updated " },
  });
  assert.equal(response.status, 200);

  response = await request("/api/auth/status", { cookie: aliceCookie });
  assert.equal(response.data.displayName, "Alice Updated");

  response = await request("/api/clothing/inventory", { cookie: aliceCookie });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-cache"), "MISS");
  assert.equal(response.data.items.length, 14);
  assert.deepEqual(
    response.data.items.map(({ name, color, imageLink }) => ({ name, color, image: imageLink })).sort((a, b) => a.name.localeCompare(b.name)),
    Object.values(previewClothingItems).flat().sort((a, b) => a.name.localeCompare(b.name)),
  );
  assert.deepEqual(
    Object.fromEntries(["shirt", "jacket", "pants", "shoes", "accessory", "hat"].map((type) => [type, response.data.items.filter((item) => item.type === type).length])),
    { shirt: 3, jacket: 3, pants: 3, shoes: 3, accessory: 2, hat: 0 },
  );
  assert.ok(response.data.items.every((item) => item.isFavorited === false));
  const firstDefaultItemId = response.data.items[0]._id;

  response = await request("/api/clothing", {
    method: "POST",
    cookie: aliceCookie,
    json: {
      type: "shirt",
      color: "black",
      name: "Bad URL",
      imageLink: "not-a-url",
    },
  });
  assert.equal(response.status, 400);

  response = await request("/api/clothing", {
    method: "POST",
    cookie: aliceCookie,
    json: {
      type: "shirt",
      color: "black",
      name: "  Clean tee  ",
      imageLink: "https://example.com/tee.png",
    },
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.item.name, "Clean tee");
  const newItemId = response.data.item._id;

  response = await request("/api/clothing/not-an-id/favorite", {
    method: "PATCH",
    cookie: aliceCookie,
    json: { isFavorited: true },
  });
  assert.equal(response.status, 400);

  response = await request(`/api/clothing/${newItemId}/favorite`, {
    method: "PATCH",
    cookie: aliceCookie,
    json: { isFavorited: "true" },
  });
  assert.equal(response.status, 400);

  response = await request(`/api/clothing/${newItemId}/favorite`, {
    method: "PATCH",
    cookie: aliceCookie,
    json: { isFavorited: true },
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.item.isFavorited, true);

  response = await signUp("bob", "Bob User");
  assert.equal(response.status, 201);
  const bobLogin = await logIn("bob");
  assert.equal(bobLogin.status, 200);
  const bobCookie = bobLogin.cookie;
  const bobInventory = await request("/api/clothing/inventory", { cookie: bobCookie });
  const bobItemId = bobInventory.data.items[0]._id;

  response = await request(`/api/clothing/${newItemId}/favorite`, {
    method: "PATCH",
    cookie: bobCookie,
    json: { isFavorited: true },
  });
  assert.equal(response.status, 403);

  response = await request("/api/outfits", {
    method: "POST",
    cookie: aliceCookie,
    json: { name: "Duplicate", clothingItems: [newItemId, newItemId] },
  });
  assert.equal(response.status, 400);

  response = await request("/api/outfits", {
    method: "POST",
    cookie: aliceCookie,
    json: { name: "Mixed-case duplicate", clothingItems: [newItemId, newItemId.toUpperCase()] },
  });
  assert.equal(response.status, 400);

  response = await request("/api/outfits", {
    method: "POST",
    cookie: aliceCookie,
    json: { name: "Uppercase ID", clothingItems: [newItemId.toUpperCase()] },
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.outfit.clothingItems[0], newItemId);
  response = await request(`/api/outfits/${response.data.outfit._id}`, {
    method: "DELETE",
    cookie: aliceCookie,
  });
  assert.equal(response.status, 204);

  response = await request("/api/outfits", {
    method: "POST",
    cookie: aliceCookie,
    json: { name: "Not mine", clothingItems: [bobItemId] },
  });
  assert.equal(response.status, 403);

  response = await request("/api/outfits", {
    method: "POST",
    cookie: aliceCookie,
    json: { name: "  Everyday  ", clothingItems: [newItemId, firstDefaultItemId] },
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.outfit.name, "Everyday");
  const outfitId = response.data.outfit._id;

  response = await request("/api/outfits", { cookie: aliceCookie });
  assert.equal(response.status, 200);
  assert.equal(response.data.outfits.length, 1);
  assert.equal(response.data.outfits[0].clothingItems.length, 2);

  response = await request(`/api/outfits/${outfitId}/favorite`, {
    method: "PATCH",
    cookie: bobCookie,
    json: { isFavorited: true },
  });
  assert.equal(response.status, 403);

  response = await request(`/api/outfits/${outfitId}/favorite`, {
    method: "PATCH",
    cookie: aliceCookie,
    json: { isFavorited: true },
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.outfit.isFavorited, true);

  response = await request(`/api/outfits/${outfitId}/name`, {
    method: "PATCH",
    json: { name: "Unauthorized" },
  });
  assert.equal(response.status, 401);

  response = await request(`/api/outfits/${outfitId}/name`, {
    method: "PATCH",
    cookie: bobCookie,
    json: { name: "Not my outfit" },
  });
  assert.equal(response.status, 403);

  response = await request("/api/outfits/invalid-id/name", {
    method: "PATCH",
    cookie: aliceCookie,
    json: { name: "Invalid ID" },
  });
  assert.equal(response.status, 400);

  for (const json of [{}, { name: "   " }, { name: "x".repeat(101) }, { name: 123 }, { name: ["Invalid"] }]) {
    response = await request(`/api/outfits/${outfitId}/name`, {
      method: "PATCH",
      cookie: aliceCookie,
      json,
    });
    assert.equal(response.status, 400);
  }

  response = await request(`/api/outfits/${outfitId}/name`, {
    method: "PATCH",
    cookie: aliceCookie,
    json: { name: "  Weekend fit  ", clothingItems: [], isFavorited: false },
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.outfit.name, "Weekend fit");
  assert.equal(response.data.outfit.isFavorited, true);
  assert.equal(response.data.outfit.clothingItems.length, 2);

  response = await request("/api/outfits", { cookie: aliceCookie });
  assert.equal(response.data.outfits[0].name, "Weekend fit");

  response = await request("/api/generator/generate", {
    method: "POST",
    cookie: aliceCookie,
    json: { selectedTypes: "shirt" },
  });
  assert.equal(response.status, 400);

  response = await request("/api/generator/generate", {
    method: "POST",
    cookie: aliceCookie,
    json: { selectedTypes: ["shirt"], accessoryCount: 6 },
  });
  assert.equal(response.status, 400);

  response = await request("/api/generator/generate", {
    method: "POST",
    cookie: aliceCookie,
    json: { selectedTypes: ["shirt"], lockedItems: [newItemId], accessoryCount: 0 },
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.success, true);
  assert.equal(response.data.outfit[0]._id, newItemId);

  response = await request(`/api/clothing/${newItemId}`, {
    method: "DELETE",
    cookie: bobCookie,
  });
  assert.equal(response.status, 403);

  response = await request(`/api/clothing/${newItemId}`, {
    method: "DELETE",
    cookie: aliceCookie,
  });
  assert.equal(response.status, 204);

  response = await request("/api/outfits", { cookie: aliceCookie });
  assert.equal(response.data.outfits[0].clothingItems.length, 1);

  const invalidUpload = new FormData();
  invalidUpload.append("image", new Blob(["text"], { type: "text/plain" }), "item.txt");
  response = await request("/api/clothing/upload", {
    method: "POST",
    cookie: aliceCookie,
    body: invalidUpload,
  });
  assert.equal(response.status, 400);
  assert.deepEqual(response.data, { error: "Only image files are allowed" });

  const oversizedUpload = new FormData();
  oversizedUpload.append(
    "image",
    new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" }),
    "large.png",
  );
  response = await request("/api/clothing/upload", {
    method: "POST",
    cookie: aliceCookie,
    body: oversizedUpload,
  });
  assert.equal(response.status, 413);
  assert.deepEqual(response.data, { error: "Image must be 5 MB or smaller." });

  response = await request("/api/clothing/upload", {
    method: "POST",
    cookie: aliceCookie,
    body: new FormData(),
  });
  assert.equal(response.status, 400);
  assert.deepEqual(response.data, { error: "No image file provided" });

  response = await request("/api/auth/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  assert.deepEqual(response.data, { error: "Request body must be valid JSON." });

  response = await request(`/api/outfits/${outfitId}`, {
    method: "DELETE",
    cookie: bobCookie,
  });
  assert.equal(response.status, 403);

  response = await request(`/api/outfits/${outfitId}`, {
    method: "DELETE",
    cookie: aliceCookie,
  });
  assert.equal(response.status, 204);

  response = await request("/api/auth/account", {
    method: "DELETE",
    cookie: bobCookie,
  });
  assert.equal(response.status, 204);
  assert.equal([...users.values()].some((user) => user.username === "bob"), false);
  assert.equal(clothingItems.size, 14);

  response = await request("/api/auth/status", { cookie: bobCookie });
  assert.equal(response.status, 401);

  response = await request("/api/auth/account", { method: "DELETE" });
  assert.equal(response.status, 401);

  response = await request("/api/auth/logout", {
    method: "POST",
    cookie: aliceCookie,
  });
  assert.equal(response.status, 200);

  response = await request("/api/auth/status", { cookie: aliceCookie });
  assert.equal(response.status, 401);
});

test("account deletion requires a session and only deletes the signed-in account", async () => {
  users.clear();
  clothingItems.clear();
  outfits.clear();

  assert.equal((await signUp("account-owner")).status, 201);
  assert.equal((await signUp("other-account")).status, 201);
  const owner = [...users.values()].find((user) => user.username === "account-owner");
  const other = [...users.values()].find((user) => user.username === "other-account");
  const ownerCookie = (await logIn("account-owner")).cookie;

  let response = await request("/api/auth/account", {
    method: "DELETE",
    json: { userId: asId(other) },
  });
  assert.equal(response.status, 401);
  assert.equal(users.has(asId(owner)), true);
  assert.equal(users.has(asId(other)), true);

  response = await request(`/api/auth/account?userId=${asId(other)}`, {
    method: "DELETE",
    cookie: ownerCookie,
    json: { userId: asId(other) },
  });
  assert.equal(response.status, 204);
  assert.equal(users.has(asId(owner)), false);
  assert.equal(users.has(asId(other)), true);
  assert.equal(clothingItems.has(asId(other.inventory[0])), true);

  response = await request("/api/auth/account", {
    method: "DELETE",
    cookie: ownerCookie,
  });
  assert.equal(response.status, 401);
  assert.equal(users.has(asId(other)), true);
});

test("multipart item creation validates first and cleans up failed saves", async (t) => {
  users.clear();
  clothingItems.clear();
  outfits.clear();

  const names = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const previousEnvironment = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const previousUpload = cloudinary.uploader.upload;
  const previousDestroy = cloudinary.uploader.destroy;
  const previousSave = ClothingItem.prototype.save;
  const previousUpdate = User.findOneAndUpdate;
  const previousError = console.error;
  const destroyed = [];
  let uploaded = 0;
  let mode = "success";
  let cleanupUnavailable = false;

  try {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
    console.error = () => {};
    assert.equal((await signUp("multipart-owner")).status, 201);
    const cookie = (await logIn("multipart-owner")).cookie;
    const owner = [...users.values()].find((user) => user.username === "multipart-owner");
    const inventoryBefore = owner.inventory.map(asId);
    const sizeBefore = clothingItems.size;
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
    const makeBody = (fields = {}) => {
      const body = new FormData();
      body.append("image", new Blob([png], { type: "image/png" }), "shirt.png");
      for (const [key, value] of Object.entries({
        name: "  Blue shirt  ", type: "shirt", color: "blue", removeBackground: "true", ...fields,
      })) body.append(key, value);
      return body;
    };

    cloudinary.uploader.upload = async (_dataUri, options) => {
      if (mode === "upload") throw new Error("Upload unavailable");
      assert.ok(options.transformation.some((step) => step.effect === "background_removal"));
      uploaded += 1;
      return {
        secure_url: `https://example.com/multipart-${uploaded}.png`,
        public_id: `malabis-clothing/multipart-${uploaded}`,
      };
    };
    cloudinary.uploader.destroy = async (publicId) => {
      destroyed.push(publicId);
      if (cleanupUnavailable) throw new Error("Cleanup unavailable");
      return { result: "ok" };
    };
    ClothingItem.prototype.save = async function save() {
      if (mode === "save-before") throw new Error("Save unavailable");
      const document = await previousSave.call(this);
      if (mode === "save-after") throw new Error("Save acknowledgment lost");
      if (mode === "account-deletion") owner.deletingAccount = true;
      return document;
    };
    User.findOneAndUpdate = async (query, update) => {
      if (update.$push?.inventory && mode === "attach-before") throw new Error("Inventory unavailable");
      const result = await previousUpdate(query, update);
      if (update.$push?.inventory && mode === "attach-after") throw new Error("Inventory acknowledgment lost");
      return result;
    };

    await t.test("authentication and metadata errors never upload an image", async () => {
      const unauthenticated = await request("/api/clothing", { method: "POST", body: makeBody() });
      assert.equal(unauthenticated.status, 401);
      for (const fields of [{ type: "cape" }, { color: "pink" }, { name: " " }]) {
        const response = await request("/api/clothing", { method: "POST", cookie, body: makeBody(fields) });
        assert.equal(response.status, 400);
      }
      assert.equal(uploaded, 0);
    });

    for (const failure of ["upload", "save-before", "save-after", "attach-before", "attach-after", "account-deletion"]) {
      await t.test(`rolls back ${failure} failure`, async () => {
        mode = failure;
        owner.deletingAccount = false;
        const destroyedBefore = destroyed.length;
        const response = await request("/api/clothing", { method: "POST", cookie, body: makeBody() });
        assert.equal(response.status, failure === "upload" ? 502 : failure === "account-deletion" ? 401 : 500);
        assert.equal(clothingItems.size, sizeBefore);
        assert.deepEqual(owner.inventory.map(asId), inventoryBefore);
        assert.deepEqual(owner.uploadedImageIds, []);
        assert.equal(destroyed.length, destroyedBefore + (failure === "upload" ? 0 : 1));
        if (failure !== "upload") assert.equal(destroyed.at(-1), `malabis-clothing/multipart-${uploaded}`);
      });
    }

    await t.test("a retry creates one item with the server's uploaded URL", async () => {
      mode = "success";
      owner.deletingAccount = false;
      const response = await request("/api/clothing", {
        method: "POST", cookie, body: makeBody({ imageLink: "https://example.com/ignored.png" }),
      });
      assert.equal(response.status, 201);
      assert.equal(response.data.item.name, "Blue shirt");
      assert.equal(response.data.item.imageLink, `https://example.com/multipart-${uploaded}.png`);
      assert.equal(clothingItems.size, sizeBefore + 1);
      assert.deepEqual(owner.inventory.map(asId), [...inventoryBefore, response.data.item._id]);
      assert.deepEqual(owner.uploadedImageIds, [`malabis-clothing/multipart-${uploaded}`]);
    });

    await t.test("provider cleanup failures keep the image tracked for deletion to retry", async () => {
      mode = "save-before";
      cleanupUnavailable = true;
      const response = await request("/api/clothing", { method: "POST", cookie, body: makeBody() });
      assert.equal(response.status, 500);
      assert.equal(clothingItems.size, sizeBefore + 1);
      assert.equal(owner.inventory.length, inventoryBefore.length + 1);
      assert.ok(owner.uploadedImageIds.includes(`malabis-clothing/multipart-${uploaded}`));
      cleanupUnavailable = false;
      const deletion = await request("/api/auth/account", { method: "DELETE", cookie });
      assert.equal(deletion.status, 204);
      assert.ok(destroyed.filter((id) => id === `malabis-clothing/multipart-${uploaded}`).length === 2);
    });
  } finally {
    cloudinary.uploader.upload = previousUpload;
    cloudinary.uploader.destroy = previousDestroy;
    ClothingItem.prototype.save = previousSave;
    User.findOneAndUpdate = previousUpdate;
    console.error = previousError;
    for (const name of names) {
      if (previousEnvironment[name] === undefined) delete process.env[name];
      else process.env[name] = previousEnvironment[name];
    }
  }
});

test("account deletion removes saved and unsaved uploads and can retry a provider failure", async () => {
  users.clear();
  clothingItems.clear();
  outfits.clear();

  const names = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const previousEnvironment = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const previousUpload = cloudinary.uploader.upload;
  const previousDestroy = cloudinary.uploader.destroy;
  const previousError = console.error;
  const destroyed = [];
  let uploaded = 0;
  let failSecondImage = true;

  try {
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
    console.error = () => {};
    cloudinary.uploader.upload = async () => {
      uploaded += 1;
      return {
        secure_url: `https://res.cloudinary.com/test-cloud/image/upload/v1/malabis-clothing/photo-${uploaded}.png`,
        public_id: `malabis-clothing/photo-${uploaded}`,
      };
    };
    cloudinary.uploader.destroy = async (publicId, options) => {
      assert.deepEqual(options, { resource_type: "image", invalidate: true });
      destroyed.push(publicId);
      if (publicId === "malabis-clothing/photo-2" && failSecondImage) {
        throw new Error("Cloudinary unavailable");
      }
      return { result: destroyed.filter((id) => id === publicId).length > 1 ? "not found" : "ok" };
    };

    assert.equal((await signUp("image-owner")).status, 201);
    const cookie = (await logIn("image-owner")).cookie;
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

    for (let index = 0; index < 2; index += 1) {
      const body = new FormData();
      body.append("image", new Blob([png], { type: "image/png" }), `photo-${index}.png`);
      const upload = await request("/api/clothing/upload", { method: "POST", cookie, body });
      assert.equal(upload.status, 200);
      assert.equal(upload.data.publicId, `malabis-clothing/photo-${index + 1}`);
      if (index === 0) {
        const item = await request("/api/clothing", {
          method: "POST", cookie,
          json: { type: "shirt", color: "blue", name: "Uploaded shirt", imageLink: upload.data.imageUrl },
        });
        assert.equal(item.status, 201);
      }
    }

    const owner = [...users.values()].find((user) => user.username === "image-owner");
    assert.deepEqual(owner.uploadedImageIds, ["malabis-clothing/photo-1", "malabis-clothing/photo-2"]);
    owner.deletingAccount = true;
    owner.deletionStartedAt = new Date(Date.now() - 11 * 60 * 1000);

    let deletion = await request("/api/auth/account", { method: "DELETE", cookie });
    assert.equal(deletion.status, 500);
    assert.equal(users.has(asId(owner)), true);
    assert.equal(owner.deletingAccount, false);
    assert.equal(owner.deletionStartedAt, null);
    assert.equal(clothingItems.has(asId(owner.inventory.at(-1))), true);

    failSecondImage = false;
    deletion = await request("/api/auth/account", { method: "DELETE", cookie });
    assert.equal(deletion.status, 204);
    assert.equal(users.has(asId(owner)), false);
    assert.equal(clothingItems.has(asId(owner.inventory.at(-1))), false);
    assert.deepEqual(destroyed, [
      "malabis-clothing/photo-1", "malabis-clothing/photo-2",
      "malabis-clothing/photo-1", "malabis-clothing/photo-2",
    ]);
  } finally {
    cloudinary.uploader.upload = previousUpload;
    cloudinary.uploader.destroy = previousDestroy;
    console.error = previousError;
    for (const name of names) {
      if (previousEnvironment[name] === undefined) delete process.env[name];
      else process.env[name] = previousEnvironment[name];
    }
  }
});
