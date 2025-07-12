import { Router } from "express";
import { User } from "../models/user.mjs";
import { hashPassword } from "../utils/helpers.mjs";
import { createUserValidationSchema, loginValidationSchema } from "../utils/validationSchemas.mjs";
import passport from "passport";
import { checkSchema, validationResult } from "express-validator";
import "../strategies/local-strategy.mjs";
import { createDefaultClothingItems } from "../utils/defaultClothing.mjs";

const router = Router() 

router.post(
  "/api/auth/login",
  checkSchema(loginValidationSchema),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  passport.authenticate("local"),
  (req, res) => {
    res.sendStatus(200);
  }
);

router.get("/api/auth/status", (req, res) => {
  return req.user ? res.send(req.user) : res.sendStatus(401);
});

router.post("/api/auth/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);
  req.logout((err) => {
    if (err) return res.sendStatus(400);
    res.sendStatus(200);
  });
});

router.post(
  "/api/auth/signup",
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, displayName } = req.body;
    const lowerCaseUsername = username.toLowerCase();

    try {
      const existingUser = await User.findOne({ username: lowerCaseUsername });
      if (existingUser) return res.status(400).send("User already exists");

      const newUser = new User({
        username: lowerCaseUsername,
        displayName,
        password: hashPassword(password),
      });

      await newUser.save();

      try {
        const defaultItemIds = await createDefaultClothingItems(newUser._id);
        
        newUser.inventory = defaultItemIds;
        await newUser.save();
      } catch (clothingError) {
        console.error('Error creating default clothing items:', clothingError);
      }

      res.sendStatus(201);
    } catch (err) {
      console.error('Signup error:', err);
      res.sendStatus(500);
    }
  }
);

router.post(
  "/api/auth/update-profile",
  async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const { displayName, password } = req.body;
    if (displayName !== undefined && displayName.trim().length < 3) {
      return res.status(400).json({ error: "Display name must be at least 3 characters." });
    }
    if (password !== undefined && password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }
    try {
      const update = {};
      if (displayName) update.displayName = displayName;
      if (password) update.password = hashPassword(password);
      await User.findByIdAndUpdate(req.user._id, update);
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(500);
    }
  }
);

export default router 