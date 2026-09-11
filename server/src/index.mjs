import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const localEnvPath = fileURLToPath(new URL("../.env.local", import.meta.url));
if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

import routes from "../api/index.mjs";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import "./strategies/local-strategy.mjs";
import cors from "cors";
import { initializeRedis, redisStatus } from "./utils/redis.mjs";

const isTest = process.env.NODE_ENV === "test";
const requiredEnvironmentVariables = ["MONGODB_URI", "SESSION_SECRET"];

if (!isTest) {
  const missingVariables = requiredEnvironmentVariables.filter(
    (name) => !process.env[name],
  );
  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  await initializeRedis();
}

const defaultOrigins = [
  "https://malabis-frontend.vercel.app",
  "http://localhost:5173",
  "https://www.malabis.io",
  "https://malabis.io",
];
const configuredOrigins = (process.env.CLIENT_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

const sessionOptions = {
  name: "malabis.sid",
  secret: process.env.SESSION_SECRET || "test-session-secret",
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
};

if (!isTest) {
  sessionOptions.store = MongoStore.create({
    client: mongoose.connection.getClient(),
  });
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "unavailable",
    database: databaseConnected ? "connected" : "disconnected",
    redis: redisStatus(),
  });
});

app.use(routes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((error, _req, res, next) => {
  if (res.headersSent) return next(error);

  let status = error.status || error.statusCode || 500;
  let message = status < 500 ? error.message : "Internal server error.";

  if (error.code === "LIMIT_FILE_SIZE") {
    status = 413;
    message = "Image must be 5 MB or smaller.";
  } else if (error.message === "Only image files are allowed") {
    status = 400;
    message = error.message;
  } else if (error.name === "CastError" || error.name === "ValidationError") {
    status = 400;
    message = "Invalid request data.";
  } else if (error.type === "entity.too.large") {
    status = 413;
    message = "JSON request body must be 1 MB or smaller.";
  } else if (error.type === "entity.parse.failed") {
    status = 400;
    message = "Request body must be valid JSON.";
  }

  if (status >= 500) console.error(error);
  return res.status(status).json({ error: message });
});

const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

export default app;
