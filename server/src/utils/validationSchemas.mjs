import {
  CLOTHING_COLORS,
  CLOTHING_TYPES,
} from "../models/clothingItem.mjs";

const itemIdValidation = {
  in: ["params"],
  isMongoId: { errorMessage: "Invalid resource ID" },
};

export const createUserValidationSchema = {
  username: {
    in: ["body"],
    isString: true,
    trim: true,
    notEmpty: { errorMessage: "Username is required" },
    isLength: {
      options: { max: 64 },
      errorMessage: "Username must be 64 characters or fewer",
    },
  },
  displayName: {
    in: ["body"],
    isString: true,
    trim: true,
    notEmpty: { errorMessage: "Display name is required" },
    isLength: {
      options: { min: 3, max: 100 },
      errorMessage: "Display name must be between 3 and 100 characters",
    },
  },
  email: {
    in: ["body"],
    optional: true,
    isEmail: { errorMessage: "Invalid email" },
  },
  password: {
    in: ["body"],
    isString: true,
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: "Password must be between 8 and 128 characters",
    },
    notEmpty: { errorMessage: "Password is required" },
  },
};

export const loginValidationSchema = {
  username: {
    in: ["body"],
    isString: true,
    trim: true,
    notEmpty: { errorMessage: "Username is required" },
  },
  password: {
    in: ["body"],
    isString: true,
    notEmpty: { errorMessage: "Password is required" },
  },
};

export const clothingItemValidationSchema = {
  type: {
    in: ["body"],
    isString: true,
    exists: {
      errorMessage: "Type is required",
    },
    isIn: {
      options: [CLOTHING_TYPES],
      errorMessage: "Invalid clothing type",
    },
  },
  color: {
    in: ["body"],
    isString: true,
    exists: {
      errorMessage: "Color is required",
    },
    isIn: {
      options: [CLOTHING_COLORS],
      errorMessage: "Invalid color",
    },
  },
  name: {
    in: ["body"],
    isString: true,
    trim: true,
    exists: {
      errorMessage: "Name is required",
    },
    notEmpty: { errorMessage: "Name cannot be empty" },
    isLength: {
      options: { max: 100 },
      errorMessage: "Name must be 100 characters or fewer",
    },
  },
  imageLink: {
    in: ["body"],
    isString: true,
    exists: {
      errorMessage: "Image link is required",
    },
    notEmpty: { errorMessage: "Image link cannot be empty" },
    isURL: {
      options: { protocols: ["http", "https"], require_protocol: true },
      errorMessage: "Image link must be a valid HTTP URL",
    },
  },
};

export const profileValidationSchema = {
  displayName: {
    in: ["body"],
    optional: true,
    isString: { errorMessage: "Display name must be a string" },
    trim: true,
    isLength: {
      options: { min: 3, max: 100 },
      errorMessage: "Display name must be between 3 and 100 characters",
    },
  },
  password: {
    in: ["body"],
    optional: true,
    isString: { errorMessage: "Password must be a string" },
    isLength: {
      options: { min: 8, max: 128 },
      errorMessage: "Password must be between 8 and 128 characters",
    },
  },
};

export const favoriteValidationSchema = {
  id: itemIdValidation,
  isFavorited: {
    in: ["body"],
    isBoolean: {
      options: { strict: true },
      errorMessage: "isFavorited must be a boolean",
    },
    toBoolean: true,
  },
};

export const resourceIdValidationSchema = { id: itemIdValidation };

export const outfitValidationSchema = {
  name: {
    in: ["body"],
    isString: { errorMessage: "Name is required" },
    trim: true,
    notEmpty: { errorMessage: "Name is required" },
    isLength: {
      options: { max: 100 },
      errorMessage: "Name must be 100 characters or fewer",
    },
  },
  clothingItems: {
    in: ["body"],
    isArray: {
      options: { min: 1, max: 20 },
      errorMessage: "clothingItems must contain between 1 and 20 items",
    },
  },
  "clothingItems.*": {
    in: ["body"],
    isMongoId: { errorMessage: "Each clothing item ID must be valid" },
  },
};

export const generatorValidationSchema = {
  selectedTypes: {
    in: ["body"],
    isArray: { errorMessage: "selectedTypes must be an array" },
  },
  "selectedTypes.*": {
    in: ["body"],
    isIn: {
      options: [CLOTHING_TYPES.filter((type) => type !== "accessory")],
      errorMessage: "selectedTypes contains an unsupported type",
    },
  },
  lockedItems: {
    in: ["body"],
    optional: true,
    isArray: { errorMessage: "lockedItems must be an array" },
  },
  "lockedItems.*": {
    in: ["body"],
    optional: true,
    isMongoId: { errorMessage: "Each locked item ID must be valid" },
  },
  accessoryCount: {
    in: ["body"],
    optional: true,
    isInt: {
      options: { min: 0, max: 5 },
      errorMessage: "accessoryCount must be an integer from 0 to 5",
    },
    toInt: true,
  },
};
