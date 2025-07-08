import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },
  displayName: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  password: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  inventory: {
    type: [mongoose.Schema.Types.ObjectId], 
    ref: "ClothingItem",
    default: [], 
  },
  outfits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Outfit",
    default: [],
  }],
});

export const User = mongoose.model("User", UserSchema); 