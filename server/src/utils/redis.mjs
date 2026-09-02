import { createClient } from "redis";

const DEFAULT_CACHE_TTL_SECONDS = 300;

let client;
let connectPromise;

function cacheTtlSeconds() {
  const configuredTtl = Number.parseInt(process.env.CACHE_TTL_SECONDS ?? "", 10);
  return Number.isInteger(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : DEFAULT_CACHE_TTL_SECONDS;
}

export async function initializeRedis() {
  if (!process.env.REDIS_URL) {
    console.log("Redis caching disabled (REDIS_URL is not set)");
    return null;
  }

  if (client?.isReady) return client;
  if (connectPromise) return connectPromise;

  client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: (retries) => (
        retries > 3 ? false : Math.min(retries * 100, 1000)
      ),
    },
  });

  client.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  connectPromise = client.connect()
    .then(() => {
      console.log("Connected to Redis");
      return client;
    })
    .catch((error) => {
      // Redis is an optimization. Keep the API available if it is down.
      console.error("Redis unavailable; continuing without cache:", error.message);
      return null;
    })
    .finally(() => {
      connectPromise = undefined;
    });

  return connectPromise;
}

export function redisStatus() {
  if (!process.env.REDIS_URL) return "disabled";
  return client?.isReady ? "connected" : "disconnected";
}

export async function getCachedJson(key) {
  if (!client?.isReady) return null;

  try {
    const value = await client.get(key);
    return value === null ? null : JSON.parse(value);
  } catch (error) {
    console.error(`Redis GET failed for ${key}:`, error.message);
    return null;
  }
}

export async function setCachedJson(key, value) {
  if (!client?.isReady) return;

  try {
    await client.set(key, JSON.stringify(value), { EX: cacheTtlSeconds() });
  } catch (error) {
    console.error(`Redis SET failed for ${key}:`, error.message);
  }
}

export async function deleteCachedKeys(...keys) {
  if (!client?.isReady || keys.length === 0) return;

  try {
    await client.del(keys);
  } catch (error) {
    console.error("Redis cache invalidation failed:", error.message);
  }
}
