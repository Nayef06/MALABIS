import assert from "node:assert/strict";
import { once } from "node:events";
import test, { after, before } from "node:test";

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
    return Promise.resolve(populatedUser(this.getValue(), this.populateValue));
  }

  then(resolve, reject) {
    return Promise.resolve(this.getValue()).then(resolve, reject);
  }
}

function applyUserUpdate(user, update) {
  if (update.$push?.inventory) user.inventory.push(update.$push.inventory);
  if (update.$push?.outfits) user.outfits.push(update.$push.outfits);
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
  user.set(directUpdate);
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
  replace(User, "findOneAndUpdate", async (query, update) => {
    const user = users.get(asId(query._id));
    if (!user) return null;
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

test("password helpers hash and verify without retaining plaintext", () => {
  const password = "a-secure-password";
  const hash = hashPassword(password);

  assert.notEqual(hash, password);
  assert.equal(comparePassword(password, hash), true);
  assert.equal(comparePassword("wrong-password", hash), false);
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
  assert.equal(clothingItems.size, 18);

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
  assert.equal(response.headers.get("x-cache"), "MISS");
  assert.equal(response.data.items.length, 18);
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

  response = await request("/api/auth/logout", {
    method: "POST",
    cookie: aliceCookie,
  });
  assert.equal(response.status, 200);

  response = await request("/api/auth/status", { cookie: aliceCookie });
  assert.equal(response.status, 401);
});
