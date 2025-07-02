import { Router } from "express";
import { Outfit } from "../models/outfit.mjs";
import { User } from "../models/user.mjs";

const router = Router();

router.get("/api/outfits", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  try {
    const user = await User.findById(req.user._id).populate({
      path: "outfits",
      populate: { path: "clothingItems" }
    });
    res.json({ outfits: user.outfits || [] });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/api/outfits", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const { name, clothingItems } = req.body;
  if (!name || !Array.isArray(clothingItems)) {
    return res.status(400).json({ error: "Name and clothingItems are required." });
  }
  try {
    const newOutfit = new Outfit({
      name,
      clothingItems,
      isFavorited: false,
    });
    const savedOutfit = await newOutfit.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { outfits: savedOutfit._id } });
    res.status(201).json({ outfit: savedOutfit });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.patch("/api/outfits/:id/favorite", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const { id } = req.params;
  const { isFavorited } = req.body;
  try {
    const outfit = await Outfit.findById(id);
    if (!outfit) return res.sendStatus(404);
    outfit.isFavorited = !!isFavorited;
    await outfit.save();
    res.json({ outfit });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.delete("/api/outfits/:id", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  const { id } = req.params;
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { outfits: id } });
    await Outfit.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router; 