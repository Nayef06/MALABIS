import mongoose from "mongoose";

export const CLOTHING_COLORS = [
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

export const CLOTHING_TYPES = [
  "shirt",
  "pants",
  "shoes",
  "hat",
  "jacket",
  "accessory",
];

const ClothingItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: CLOTHING_TYPES,
  },
  color: {
    type: String,
    required: true,
    enum: CLOTHING_COLORS,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageLink: {
    type: String,
    required: true,
  },
  isFavorited: {
    type: Boolean,
    default: false,
  },
});

export const ClothingItem = mongoose.model("ClothingItem", ClothingItemSchema);
