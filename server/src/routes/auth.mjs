import { Router } from "express";
import { User } from "../models/user.mjs";
import {
  asyncHandler,
  hashPassword,
  requireAuthentication,
  validateRequest,
} from "../utils/helpers.mjs";
import {
  createUserValidationSchema,
  loginValidationSchema,
  profileValidationSchema,
} from "../utils/validationSchemas.mjs";
import passport from "passport";
import { checkSchema } from "express-validator";
import { createDefaultClothingItems } from "../utils/defaultClothing.mjs";

const router = Router();

router.post(
  "/api/auth/login",
  checkSchema(loginValidationSchema),
  validateRequest,
  passport.authenticate("local"),
  (_req, res) => res.sendStatus(200),
);

router.get("/api/auth/status", requireAuthentication, (req, res) => {
  res.json({
    _id: req.user._id,
    username: req.user.username,
    displayName: req.user.displayName,
  });
});

router.post("/api/auth/logout", requireAuthentication, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    return req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie("malabis.sid");
      return res.sendStatus(200);
    });
  });
});

router.post(
  "/api/auth/signup",
  checkSchema(createUserValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { username, password, displayName } = req.body;
    const lowerCaseUsername = username.toLowerCase();

    try {
      const existingUser = await User.findOne({ username: lowerCaseUsername });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists." });
      }

      const newUser = new User({
        username: lowerCaseUsername,
        displayName,
        password: hashPassword(password),
      });

      await newUser.save();

      try {
        const defaultItemIds = await createDefaultClothingItems();
        newUser.inventory = defaultItemIds;
        await newUser.save();
      } catch (clothingError) {
        console.error("Error creating default clothing items:", clothingError);
      }

      return res.sendStatus(201);
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: "User already exists." });
      }
      throw err;
    }
  }),
);

router.post(
  "/api/auth/update-profile",
  requireAuthentication,
  checkSchema(profileValidationSchema),
  validateRequest,
  asyncHandler(async (req, res) => {
    const { displayName, password } = req.body;
    if (displayName === undefined && password === undefined) {
      return res.status(400).json({ error: "No profile changes were provided." });
    }

    const update = {};
    if (displayName !== undefined) update.displayName = displayName;
    if (password !== undefined) update.password = hashPassword(password);

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      runValidators: true,
    });
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    return res.sendStatus(200);
  }),
);

export default router;
