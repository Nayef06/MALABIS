import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import routes from '../api/index.mjs';
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import "./strategies/local-strategy.mjs";
import cors from "cors";

const app = express();

const allowedOrigins = [
  'https://malabis-frontend.vercel.app',
  'http://localhost:5173'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60 * 24,
  },
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
  }),
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

export default app;
