import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClient } from "redis";
import { getDefaultClothingRecords } from "../src/utils/defaultClothing.mjs";
import { migrateDefaultClothingForUser } from "../src/services/migrateDefaultClothing.mjs";

const serverRoot = fileURLToPath(new URL("../", import.meta.url));

async function main() {
  const { values } = parseArgs({ options: {
    "env-file": { type: "string", default: ".env.local" },
    username: { type: "string" },
    all: { type: "boolean", default: false },
    apply: { type: "boolean", default: false },
    "asset-origin": { type: "string" },
  } });
  if (Boolean(values.username) === values.all) throw new Error("Select exactly one of --username NAME or --all. Omit --apply for a dry run.");
  const envPath = path.resolve(serverRoot, values["env-file"]);
  const selected = dotenv.parse(await readFile(envPath));
  // Require a URI in the selected file; never silently fall back to a hosted DB.
  if (!selected.MONGODB_URI) throw new Error("The selected environment file must define MONGODB_URI.");
  let fallback = {};
  if (envPath === path.join(serverRoot, ".env.local")) {
    try { fallback = dotenv.parse(await readFile(path.join(serverRoot, ".env"))); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  const config = { ...fallback, ...selected };
  const hosts = selected.MONGODB_URI.replace(/^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?/, "").split(/[/?]/, 1)[0];
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(hosts);
  if (values.apply && !local) {
    if (!values["asset-origin"]) throw new Error("Hosted migration requires --asset-origin https://YOUR-CLIENT-HOST so new images can be checked before writing.");
    const origin = new URL(values["asset-origin"]);
    if (!["http:", "https:"].includes(origin.protocol)) throw new Error("Asset origin must be an HTTP or HTTPS URL.");
    await Promise.all(getDefaultClothingRecords().map(async (item) => {
      const response = await fetch(new URL(item.imageLink, origin), { method: "HEAD", signal: AbortSignal.timeout(15000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) throw new Error(`Deploy the new client assets before migrating: ${item.name} is unavailable.`);
    }));
  }

  const connection = await mongoose.createConnection(selected.MONGODB_URI, { serverSelectionTimeoutMS: 10000, autoIndex: false, autoCreate: false }).asPromise();
  let cache;
  try {
    const db = connection.db;
    console.log(JSON.stringify({ mode: values.apply ? "apply" : "dry-run", host: connection.host, database: db.databaseName, scope: values.all ? "all-users" : values.username.trim().toLowerCase() }));
    if (values.apply && config.REDIS_URL) {
      cache = createClient({ url: config.REDIS_URL, socket: { connectTimeout: 5000, reconnectStrategy: false } });
      cache.on("error", () => {});
      // Fail before account changes if its active read cache cannot be cleared.
      await cache.connect();
    }
    const filter = values.all ? {} : { username: values.username.trim().toLowerCase() };
    const cursor = db.collection("users").find(filter, { projection: { username: 1, inventory: 1, outfits: 1, uploadedImageIds: 1, deletingAccount: 1 } }).sort({ _id: 1 });
    let accounts = 0;
    for await (const user of cursor) {
      const summary = await migrateDefaultClothingForUser(db, user, {
        apply: values.apply,
        backupDirectory: path.join(serverRoot, "migration-backups", `${connection.host}-${db.databaseName}`.replace(/[^a-zA-Z0-9._-]/g, "_")),
      });
      if (cache && ["applied", "already-applied"].includes(summary.status)) {
        await cache.del([`malabis:user:${user._id}:inventory`, `malabis:user:${user._id}:outfits`]);
      }
      console.log(JSON.stringify(summary));
      accounts += 1;
    }
    if (!accounts && !values.all) throw new Error("The requested account was not found in the selected database.");
    console.log(JSON.stringify({ accounts, mode: values.apply ? "apply" : "dry-run" }));
  } finally {
    if (cache?.isOpen) await cache.quit();
    await connection.close();
  }
}

main().catch((error) => {
  console.error(error.message.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g, "[database URI redacted]"));
  process.exitCode = 1;
});
