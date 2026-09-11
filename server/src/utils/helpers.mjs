import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

const saltRounds = 10;

export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (plain, hashed) => {
  return bcrypt.compareSync(plain, hashed);
};

export function requireAuthentication(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  return next();
}

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  return next();
}

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
