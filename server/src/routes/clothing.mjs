import { Router } from "express";
import { ClothingItem } from "../models/clothingItem.mjs";
import { Outfit } from "../models/outfit.mjs";
import {
  clothingItemValidationSchema,
  favoriteValidationSchema,
  resourceIdValidationSchema,
} from "../utils/validationSchemas.mjs";
import { checkSchema } from "express-validator";
import { User } from "../models/user.mjs";
import multer from "multer";
import { uploadToCloudinary } from "../utils/cloudinary.mjs";
import {
  asyncHandler,
  requireAuthentication,
  validateRequest,
} from "../utils/helpers.mjs";
import {
  getUserInventory,
  invalidateInventory,
  invalidateUserData,
} from "../services/userData.mjs";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const isImage = file.mimetype?.startsWith("image/");
    callback(isImage ? null : new Error("Only image files are allowed"), isImage);
  },
});

async function sendInventory(req, res) {
  const { data, cacheHit } = await getUserInventory(req.user._id);
  res.set("X-Cache", cacheHit ? "HIT" : "MISS");
  return data;
}

router.get(
  "/api/clothing",
  requireAuthentication,
  asyncHandler(async (req, res) => {
    const inventory = await sendInventory(req, res);
    res.json({ inventory });
  }),
);

router.post(
  "/api/clothing",
  requireAuthentication,
  checkSchema(clothingItemValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const newItem = new ClothingItem({
      type: req.body.type,
      color: req.body.color,
      name: req.body.name,
      imageLink: req.body.imageLink,
    });

    let savedItem;
    try {
      savedItem = await newItem.save();

      const owner = await User.findByIdAndUpdate(
        req.user._id,
        { $push: { inventory: savedItem._id } },
      );
      if (!owner) {
        await ClothingItem.findByIdAndDelete(savedItem._id);
        return res.status(401).json({ error: "Authentication required." });
      }

      await invalidateInventory(req.user._id);
      return res.status(201).json({ item: savedItem });
    } catch (err) {
      if (savedItem) {
        await ClothingItem.findByIdAndDelete(savedItem._id).catch(() => {});
      }
      throw err;
    }
  }),
);

router.get(
  "/api/clothing/inventory",
  requireAuthentication,
  asyncHandler(async (req, res) => {
    const inventory = await sendInventory(req, res);
    res.json({ items: inventory });
  }),
);

router.delete(
  "/api/clothing/:id",
  requireAuthentication,
  checkSchema(resourceIdValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const itemId = req.params.id;
    const owner = await User.findOneAndUpdate(
      { _id: req.user._id, inventory: itemId },
      { $pull: { inventory: itemId } },
    );
    if (!owner) {
      return res.status(403).json({ error: "Not authorized to delete this item." });
    }

    await Promise.all([
      ClothingItem.findByIdAndDelete(itemId),
      Outfit.updateMany(
        { _id: { $in: owner.outfits } },
        { $pull: { clothingItems: itemId } },
      ),
    ]);
    await invalidateUserData(req.user._id);
    return res.sendStatus(204);
  }),
);

router.patch(
  "/api/clothing/:id/favorite",
  requireAuthentication,
  checkSchema(favoriteValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const itemId = req.params.id;
    const ownsItem = await User.exists({ _id: req.user._id, inventory: itemId });
    if (!ownsItem) {
      return res.status(403).json({ error: "Not authorized to favorite this item." });
    }

    const item = await ClothingItem.findById(itemId);
    if (!item) return res.sendStatus(404);
    item.isFavorited = req.body.isFavorited;
    await item.save();
    await invalidateUserData(req.user._id);
    return res.json({ item });
  }),
);

router.post(
  "/api/clothing/upload",
  requireAuthentication,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const shouldRemoveBackground = req.body.removeBackground === "true";
    const uploadResult = await uploadToCloudinary(req.file, shouldRemoveBackground);

    if (!uploadResult.success) {
      return res.status(502).json({
        error: uploadResult.error || "Failed to upload image",
      });
    }

    return res.json({
      success: true,
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  }),
);

export default router;
