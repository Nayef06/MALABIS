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

export default router 