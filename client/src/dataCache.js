import { apiFetch } from './api';

const STORAGE_KEY = 'malabis:data-cache:v1';

function readStoredCache() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

const cache = {
  inventory: null,
  outfits: null,
  ...readStoredCache(),
};

const pending = {};

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // The in-memory cache still works when storage is unavailable or full.
  }
}

async function loadOnce(key, endpoint, responseKey) {
  if (Array.isArray(cache[key])) return cache[key];
  if (pending[key]) return pending[key];

  pending[key] = apiFetch(endpoint)
    .then(async response => {
      if (!response.ok) throw new Error(`Failed to load ${key}`);
      const data = await response.json();
      cache[key] = data[responseKey] || [];
      persist();
      return cache[key];
    })
    .finally(() => {
      delete pending[key];
    });

  return pending[key];
}

function update(key, updater) {
  if (!Array.isArray(cache[key])) return null;
  cache[key] = updater(cache[key]);
  persist();
  return cache[key];
}

export function getInventory() {
  return loadOnce('inventory', '/api/clothing/inventory', 'items');
}

export function setInventory(items) {
  cache.inventory = items;
  persist();
  return cache.inventory;
}

export function addInventoryItem(item) {
  return update('inventory', items => [...items, item]);
}

export function updateInventoryItem(itemId, changes) {
  update('outfits', outfits => outfits.map(outfit => ({
    ...outfit,
    clothingItems: (outfit.clothingItems || []).map(item => (
      item?._id === itemId ? { ...item, ...changes } : item
    )),
  })));
  return update('inventory', items => items.map(item => (
    item._id === itemId ? { ...item, ...changes } : item
  )));
}

export function removeInventoryItem(itemId) {
  update('outfits', outfits => outfits.map(outfit => ({
    ...outfit,
    clothingItems: (outfit.clothingItems || []).filter(item => item?._id !== itemId),
  })));
  return update('inventory', items => items.filter(item => item._id !== itemId));
}

export function getOutfits() {
  return loadOnce('outfits', '/api/outfits', 'outfits');
}

export function addOutfit(outfit) {
  const inventoryById = new Map((cache.inventory || []).map(item => [item._id, item]));
  const hydrated = {
    ...outfit,
    clothingItems: (outfit.clothingItems || []).map(item => (
      typeof item === 'string' ? (inventoryById.get(item) || item) : item
    )),
  };
  update('outfits', outfits => [...outfits, hydrated]);
  return hydrated;
}

export function updateOutfit(outfitId, changes) {
  return update('outfits', outfits => outfits.map(outfit => (
    outfit._id === outfitId ? { ...outfit, ...changes } : outfit
  )));
}

export function removeOutfit(outfitId) {
  return update('outfits', outfits => outfits.filter(outfit => outfit._id !== outfitId));
}

export function clearDataCache() {
  cache.inventory = null;
  cache.outfits = null;
  delete pending.inventory;
  delete pending.outfits;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else is needed when storage is unavailable.
  }
}
