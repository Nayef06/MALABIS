import mongoose from "mongoose";

const allowedColors = [
  "red",
  "blue",
  "green",
  "yellow",
  "black",
  "white",
  "purple",
  "orange",
  "gray",
  "brown"
];

const ClothingItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["shirt", "pants", "shoes", "hat", "jacket", "accessory"],
  },
  color: {
    type: String,
    required: true,
    enum: allowedColors,
  }
});

export const ClothingItem = mongoose.model("ClothingItem", ClothingItemSchema); 