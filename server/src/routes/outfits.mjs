import { Router } from "express";
import { checkSchema } from "express-validator";
import { Outfit } from "../models/outfit.mjs";
import { User } from "../models/user.mjs";
import {
  favoriteValidationSchema,
  outfitValidationSchema,
  resourceIdValidationSchema,
} from "../utils/validationSchemas.mjs";
import {
  asyncHandler,
  requireAuthentication,
  validateRequest,
} from "../utils/helpers.mjs";
import { getUserOutfits, invalidateOutfits } from "../services/userData.mjs";

const router = Router();

router.get(
  "/api/outfits",
  requireAuthentication,
  asyncHandler(async (req, res) => {
    const { data, cacheHit } = await getUserOutfits(req.user._id);
    res.set("X-Cache", cacheHit ? "HIT" : "MISS");
    res.json({ outfits: data });
  }),
);

router.post(
  "/api/outfits",
  requireAuthentication,
  checkSchema(outfitValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, clothingItems } = req.body;
    const uniqueItemIds = new Set(clothingItems);
    if (uniqueItemIds.size !== clothingItems.length) {
      return res.status(400).json({
        error: "An outfit cannot contain duplicate items.",
      });
    }

    const user = await User.findById(req.user._id).select("inventory");
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const inventoryIds = new Set(user.inventory.map(String));
    if (clothingItems.some((itemId) => !inventoryIds.has(itemId))) {
      return res.status(403).json({
        error: "An outfit can only contain items from your inventory.",
      });
    }

    const newOutfit = new Outfit({
      name,
      clothingItems,
      isFavorited: false,
    });

    let savedOutfit;
    try {
      savedOutfit = await newOutfit.save();
      const owner = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { outfits: savedOutfit._id } },
      );
      if (!owner) {
        await Outfit.findByIdAndDelete(savedOutfit._id);
        return res.status(401).json({ error: "Authentication required." });
      }

      await invalidateOutfits(req.user._id);
      return res.status(201).json({ outfit: savedOutfit });
    } catch (error) {
      if (savedOutfit) {
        await Outfit.findByIdAndDelete(savedOutfit._id).catch(() => {});
      }
      throw error;
    }
  }),
);

router.patch(
  "/api/outfits/:id/favorite",
  requireAuthentication,
  checkSchema(favoriteValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const ownsOutfit = await User.exists({ _id: req.user._id, outfits: id });
    if (!ownsOutfit) {
      return res.status(403).json({ error: "Not authorized to update this outfit." });
    }
    const outfit = await Outfit.findById(id);
    if (!outfit) return res.sendStatus(404);
    outfit.isFavorited = req.body.isFavorited;
    await outfit.save();
    await invalidateOutfits(req.user._id);
    return res.json({ outfit });
  }),
);

router.delete(
  "/api/outfits/:id",
  requireAuthentication,
  checkSchema(resourceIdValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const owner = await User.findOneAndUpdate(
      { _id: req.user._id, outfits: id },
      { $pull: { outfits: id } },
    );
    if (!owner) {
      return res.status(403).json({ error: "Not authorized to delete this outfit." });
    }
    await Outfit.findByIdAndDelete(id);
    await invalidateOutfits(req.user._id);
    return res.sendStatus(204);
  }),
);

export default router;
