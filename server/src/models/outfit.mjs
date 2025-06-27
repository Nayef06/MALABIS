import mongoose from "mongoose";

const OutfitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  clothingItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClothingItem",
    required: true,
  }],
  isFavorited: {
    type: Boolean,
    default: false,
  },
});

export const Outfit = mongoose.model("Outfit", OutfitSchema); 