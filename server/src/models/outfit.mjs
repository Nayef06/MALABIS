import mongoose from "mongoose";

const OutfitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  clothingItems: [{
    clothingItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClothingItem",
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    size: { type: Number, required: true },
  }],
  isFavorited: {
    type: Boolean,
    default: false,
  },
  owners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
});

export const Outfit = mongoose.model("Outfit", OutfitSchema); 