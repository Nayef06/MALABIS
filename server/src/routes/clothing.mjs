import { Router } from "express";
import "../strategies/local-strategy.mjs";
import { ClothingItem } from "../models/clothingItem.mjs";
import { clothingItemValidationSchema } from "../utils/validationSchemas.mjs";
import { checkSchema, validationResult } from "express-validator";
import { User } from "../models/user.mjs";

const router = Router()

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
    // req.user.inventory is an array of ObjectIds
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
    // Only allow if the item is in the user's inventory
    const user = await User.findById(req.user._id);
    if (!user.inventory.map(String).includes(itemId)) {
      return res.status(403).json({ error: 'Not authorized to delete this item.' });
    }
    // Remove from inventory
    user.inventory = user.inventory.filter(id => String(id) !== itemId);
    await user.save();
    // Delete the clothing item itself
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

export default router 