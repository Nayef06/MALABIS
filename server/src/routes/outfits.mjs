import { Router } from "express";
import { Outfit } from "../models/outfit.mjs";
import { User } from "../models/user.mjs";
import { getUserOutfits, invalidateOutfits } from "../services/userData.mjs";

const router = Router();

router.get("/api/outfits", async (req, res) => {
  if (!req.user) return res.sendStatus(401);
  try {
    const { data, cacheHit } = await getUserOutfits(req.user._id);
    res.set("X-Cache", cacheHit ? "HIT" : "MISS");
    res.json({ outfits: data });
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
    await invalidateOutfits(req.user._id);
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
    const ownsOutfit = await User.exists({ _id: req.user._id, outfits: id });
    if (!ownsOutfit) {
      return res.status(403).json({ error: "Not authorized to update this outfit." });
    }
    const outfit = await Outfit.findById(id);
    if (!outfit) return res.sendStatus(404);
    outfit.isFavorited = !!isFavorited;
    await outfit.save();
    await invalidateOutfits(req.user._id);
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
    const owner = await User.findOneAndUpdate(
      { _id: req.user._id, outfits: id },
      { $pull: { outfits: id } },
    );
    if (!owner) {
      return res.status(403).json({ error: "Not authorized to delete this outfit." });
    }
    await Outfit.findByIdAndDelete(id);
    await invalidateOutfits(req.user._id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
