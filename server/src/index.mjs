import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const localEnvPath = fileURLToPath(new URL("../.env.local", import.meta.url));
if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
}
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

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
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://malabis-frontend.vercel.app',
  'http://localhost:5173',
  'https://www.malabis.io',
  'https://malabis.io'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required. Add it to server/.env.");
}

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60 * 24,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  store: MongoStore.create({
    client: mongoose.connection.getClient(),
  }),
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.use(routes);

const isMainModule = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

export default app;
