import { Router } from "express";
import { Outfit } from "../models/outfit.mjs";
import { User } from "../models/user.mjs";

const router = Router();

// Get all outfits (for now, not user-specific)
router.get("/api/outfits", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  try {
    const outfits = await Outfit.find().populate("clothingItems");
    res.json({ outfits });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Create a new outfit
router.post("/api/outfits", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const { name, clothingItems } = req.body;
  if (!name || !Array.isArray(clothingItems) || clothingItems.some(item => !item.clothingItem || typeof item.x !== 'number' || typeof item.y !== 'number' || typeof item.size !== 'number')) {
    return res.status(400).json({ error: "Name and clothingItems (with clothingItem, x, y, size) are required." });
  }
  try {
    const newOutfit = new Outfit({
      name,
      clothingItems,
      isFavorited: false,
      owners: [req.user._id],
    });
    const savedOutfit = await newOutfit.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { outfits: savedOutfit._id } });
    res.status(201).json({ outfit: savedOutfit });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router; 