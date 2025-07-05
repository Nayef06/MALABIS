import { Router } from "express";
import "../strategies/local-strategy.mjs";
import { ClothingItem } from "../models/clothingItem.mjs";
import { clothingItemValidationSchema } from "../utils/validationSchemas.mjs";
import { checkSchema, validationResult } from "express-validator";
import { User } from "../models/user.mjs";
import multer from "multer";
import { uploadToCloudinary } from "../utils/cloudinary.mjs";

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.get("/api/clothing", (req, res) => {
  if (!req.user) {
    return res.sendStatus(401); 
  }

  res.json({ inventory: req.user.inventory });
}); 

router.post(
  "/api/clothing",
  checkSchema(clothingItemValidationSchema),
  async (req, res) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newItem = new ClothingItem({
        type: req.body.type,
        color: req.body.color,
        name: req.body.name,
        imageLink: req.body.imageLink,
        id: req.body.id,
      });

      const savedItem = await newItem.save();

      const user = await User.findById(req.user._id);
      user.inventory.push(savedItem._id);
      await user.save();

      res.status(201).json({ item: savedItem });
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
);

router.get("/api/clothing/inventory", async (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }
  try {
    const items = await ClothingItem.find({ _id: { $in: req.user.inventory } });
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.delete("/api/clothing/:id", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const itemId = req.params.id;
  try {
    const user = await User.findById(req.user._id);
    if (!user.inventory.map(String).includes(itemId)) {
      return res.status(403).json({ error: 'Not authorized to delete this item.' });
    }
    user.inventory = user.inventory.filter(id => String(id) !== itemId);
    await user.save();
    await ClothingItem.findByIdAndDelete(itemId);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.patch("/api/clothing/:id/favorite", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const itemId = req.params.id;
  const { isFavorited } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user.inventory.map(String).includes(itemId)) {
      return res.status(403).json({ error: 'Not authorized to favorite this item.' });
    }
    const item = await ClothingItem.findById(itemId);
    if (!item) return res.sendStatus(404);
    item.isFavorited = !!isFavorited;
    await item.save();
    res.json({ item });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


router.post("/api/clothing/upload", upload.single('image'), async (req, res) => {
  if (!req.user) {
    return res.sendStatus(401);
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const shouldRemoveBackground = req.body.removeBackground === 'true';

  try {
    const uploadResult = await uploadToCloudinary(req.file, shouldRemoveBackground);
    
    if (!uploadResult.success) {
      return res.status(500).json({ error: uploadResult.error || 'Failed to upload image' });
    }

    res.json({ 
      success: true, 
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router 