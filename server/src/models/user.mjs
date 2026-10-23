import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  displayName: {
    type: mongoose.Schema.Types.String,
    required: true,
    trim: true,
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
  uploadedImageIds: {
    type: [String],
    default: [],
  },
  deletingAccount: {
    type: Boolean,
    default: false,
  },
  deletionStartedAt: {
    type: Date,
    default: null,
  },
});

export const User = mongoose.model("User", UserSchema);
