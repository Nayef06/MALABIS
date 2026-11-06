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
import { deleteCloudinaryImages, uploadToCloudinary } from "../utils/cloudinary.mjs";
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

const validateItem = checkSchema(clothingItemValidationSchema);
const validateUploadedItem = checkSchema(Object.fromEntries(
  Object.entries(clothingItemValidationSchema).filter(([field]) => field !== "imageLink"),
));

async function uploadTrackedImage(req, res) {
  const result = await uploadToCloudinary(req.file, req.body.removeBackground === "true");
  if (!result.success) {
    res.status(502).json({ error: result.error || "Failed to upload image" });
    return null;
  }

  try {
    const owner = await User.findOneAndUpdate({
      _id: req.user._id,
      deletingAccount: { $ne: true },
    }, {
      $addToSet: { uploadedImageIds: result.publicId },
    });
    if (!owner) {
      const error = new Error("Authentication required.");
      error.status = 401;
      throw error;
    }
  } catch (error) {
    await deleteCloudinaryImages([result.publicId]).catch((cleanupError) => {
      console.error("Could not clean up untracked image:", cleanupError);
    });
    throw error;
  }

  return result;
}

async function discardUploadedImage(userId, publicId) {
  try {
    await deleteCloudinaryImages([publicId]);
    await User.findByIdAndUpdate(userId, { $pull: { uploadedImageIds: publicId } });
  } catch (error) {
    // Keep the tracked ID when the provider is unavailable so account cleanup can retry.
    console.error("Could not clean up failed item upload:", error);
  }
}

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
  upload.single("image"),
  asyncHandler(async (req, _res, next) => {
    await (req.file ? validateUploadedItem : validateItem).run(req);
    next();
  }),
  validateRequest,
  asyncHandler(async (req, res) => {
    const uploaded = req.file ? await uploadTrackedImage(req, res) : null;
    if (req.file && !uploaded) return;

    const newItem = new ClothingItem({
      type: req.body.type,
      color: req.body.color,
      name: req.body.name,
      imageLink: uploaded ? uploaded.url : req.body.imageLink,
    });

    let savedItem;
    try {
      savedItem = await newItem.save();

      const owner = await User.findOneAndUpdate(
        { _id: req.user._id, deletingAccount: { $ne: true } },
        { $push: { inventory: savedItem._id } },
      );
      if (!owner) {
        const error = new Error("Authentication required.");
        error.status = 401;
        throw error;
      }
    } catch (err) {
      await ClothingItem.findByIdAndDelete(newItem._id).catch((cleanupError) => {
        console.error("Could not clean up failed clothing item:", cleanupError);
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { inventory: newItem._id },
      }).catch((cleanupError) => {
        console.error("Could not clean up failed inventory entry:", cleanupError);
      });
      if (uploaded) await discardUploadedImage(req.user._id, uploaded.publicId);
      throw err;
    }

    await invalidateInventory(req.user._id);
    return res.status(201).json({ item: savedItem });
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

    const uploadResult = await uploadTrackedImage(req, res);
    if (!uploadResult) return;

    return res.json({
      success: true,
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  }),
);

export default router;
