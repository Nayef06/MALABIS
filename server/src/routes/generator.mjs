import { Router } from "express";
import { checkSchema } from "express-validator";
import { getUserInventory } from "../services/userData.mjs";
import { generatorValidationSchema } from "../utils/validationSchemas.mjs";
import {
  asyncHandler,
  requireAuthentication,
  validateRequest,
} from "../utils/helpers.mjs";

const router = Router();

const ITEM_ORDER = ["hat", "jacket", "shirt", "pants", "shoes"];

export function generateOutfit(
  inventory,
  { selectedTypes, lockedItems = [], accessoryCount = 0 },
  random = Math.random,
) {
  const selectedTypeSet = new Set(selectedTypes);
  const lockedItemIds = new Set(lockedItems);
  const itemsByType = inventory.reduce((groups, item) => {
    (groups[item.type] ??= []).push(item);
    return groups;
  }, {});
  const lockedItemsData = inventory.filter((item) => (
    lockedItemIds.has(String(item._id))
  ));
  const outfit = [];
  const missingTypes = [];

  for (const type of ITEM_ORDER) {
    if (!selectedTypeSet.has(type)) continue;

    const lockedItem = lockedItemsData.find((item) => item.type === type);
    if (lockedItem) {
      outfit.push(lockedItem);
      continue;
    }

    const availableItems = (itemsByType[type] ?? []).filter((item) => (
      !lockedItemIds.has(String(item._id))
    ));
    if (availableItems.length === 0) {
      missingTypes.push(type);
      continue;
    }

    outfit.push(availableItems[Math.floor(random() * availableItems.length)]);
  }

  if (accessoryCount > 0) {
    const lockedAccessories = lockedItemsData.filter(
      (item) => item.type === "accessory",
    );
    outfit.push(...lockedAccessories);

    const availableAccessories = (itemsByType.accessory ?? []).filter((item) => (
      !lockedItemIds.has(String(item._id))
    ));
    const remaining = Math.min(accessoryCount, 5) - lockedAccessories.length;

    for (let i = 0; i < Math.min(remaining, availableAccessories.length); i += 1) {
      const randomIndex = Math.floor(random() * availableAccessories.length);
      outfit.push(...availableAccessories.splice(randomIndex, 1));
    }
  }

  return {
    outfit,
    missingTypes,
    success: outfit.length > 0,
  };
}

router.post(
  "/api/generator/generate",
  requireAuthentication,
  checkSchema(generatorValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { data: inventory } = await getUserInventory(req.user._id);
    res.json(generateOutfit(inventory, req.body));
  }),
);

export default router;
