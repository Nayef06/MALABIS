import { User } from "../models/user.mjs";
import {
  deleteCachedKeys,
  getCachedJson,
  setCachedJson,
} from "../utils/redis.mjs";

const inventoryKey = (userId) => `malabis:user:${userId}:inventory`;
const outfitsKey = (userId) => `malabis:user:${userId}:outfits`;

async function readThrough(key, loader) {
  const cached = await getCachedJson(key);
  if (cached !== null) return { data: cached, cacheHit: true };

  const data = await loader();
  await setCachedJson(key, data);
  return { data, cacheHit: false };
}

export function getUserInventory(userId) {
  return readThrough(inventoryKey(userId), async () => {
    const user = await User.findById(userId).populate("inventory").lean();
    return user?.inventory ?? [];
  });
}

export function getUserOutfits(userId) {
  return readThrough(outfitsKey(userId), async () => {
    const user = await User.findById(userId).populate({
      path: "outfits",
      populate: { path: "clothingItems" },
    }).lean();
    return user?.outfits ?? [];
  });
}

export function invalidateInventory(userId) {
  return deleteCachedKeys(inventoryKey(userId));
}

export function invalidateOutfits(userId) {
  return deleteCachedKeys(outfitsKey(userId));
}

export function invalidateUserData(userId) {
  return deleteCachedKeys(inventoryKey(userId), outfitsKey(userId));
}
