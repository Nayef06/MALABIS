import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

const saltRounds = 10;

export const hashPassword = (password) => bcrypt.hash(password, saltRounds);

export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

export function requireAuthentication(req, res, next) {
  res.set("Cache-Control", "private, no-store");
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  return next();
}

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(({ type, msg, path, location }) => ({
        type, msg, path, location,
      })),
    });
  }

  return next();
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
