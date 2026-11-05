# MALABIS

MALABIS is a full-stack wardrobe organizer and outfit builder. Users can upload and categorize clothing, save and favorite looks, and generate outfit combinations from the items in their closet.

## Features

- Session-based signup, login, logout, and profile management
- Wardrobe organization by clothing type and color
- Image uploads through Cloudinary, with optional background removal
- Favorite clothing and outfit filters
- A drag-and-drop outfit canvas for arranging, resizing, rotating, and layering pieces
- Outfit generation by selected clothing types, locked items, and accessory count
- Responsive React interface for desktop and mobile
- Optional Redis caching for wardrobe and outfit reads

## Tech stack

- **Client:** React 18, React Router 6, Vite, CSS
- **API:** Node.js 20.9+, Express, Passport, express-session
- **Data:** MongoDB, Mongoose, optional Redis cache
- **Images:** Multer, Sharp, Cloudinary
- **Deployment:** Vercel configurations for separate client and server projects

## Project structure

```text
malabis/
|-- client/                 # React/Vite application
|   |-- public/             # Static assets, including images/default-clothing/
|   `-- src/
|       |-- components/     # Shared UI and outfit canvas
|       |-- pages/          # Application pages
|       |-- api.js          # Credentialed API client
|       |-- dataCache.js    # In-browser data cache
|       `-- App.jsx         # Client routes
|-- server/                 # Express API
|   |-- api/                # Vercel serverless entry points
|   |-- src/
|   |   |-- models/         # Mongoose models
|   |   |-- routes/         # API endpoints
|   |   |-- services/       # User data and cache operations
|   |   |-- strategies/     # Passport local strategy
|   |   `-- utils/          # Validation, Redis, and Cloudinary helpers
|   `-- test/               # Node.js backend tests
|-- compose.yaml            # Local MongoDB and Redis services
`-- README.md
```

## Local development

### Prerequisites

- Node.js 20.9 or newer
- npm
- MongoDB, either local or hosted
- Docker Desktop if you want to use the included MongoDB and Redis services
- A Cloudinary account only if you need clothing image uploads

### 1. Clone and install

```bash
git clone https://github.com/Nayef06/malabis.git
cd malabis

cd client
npm ci
cd ../server
npm ci
cd ..
```

### 2. Start local services

With Docker Desktop running, start MongoDB and Redis from the repository root:

```bash
docker compose up -d mongodb redis
```

MongoDB data and Redis data are persisted in the `mongodb_data` and `redis_data` Docker volumes. Redis is optional; if `REDIS_URL` is not set or Redis is unavailable, the API continues without caching.

### 3. Configure environment variables

Copy the checked-in examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Server settings:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `SESSION_SECRET` | Yes | Secret used to sign sessions |
| `COOKIE_SECRET` | No | Secret used by `cookie-parser` |
| `REDIS_URL` | No | Redis connection string; enables caching |
| `CACHE_TTL_SECONDS` | No | Cache TTL; defaults to 300 seconds |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `CLIENT_ORIGINS` | No | Additional comma-separated CORS origins |
| `PORT` | No | API port; defaults to 3000 |
| `NODE_ENV` | No | Use `production` in production |

The server loads `server/.env.local` first and then fills missing values from `server/.env`. Both files are ignored by Git.

For local development, leave `VITE_API_BASE_URL` empty; Vite proxies `/api` requests to `http://localhost:3000`. In a production client build, set it to the public API origin when the API is hosted separately.

New accounts start with the 14 pieces in `client/public/images/default-clothing/`. The landing page uses the same pieces for its interactive preview. The client (`client/src/starterClothing.mjs`) and server (`server/src/utils/defaultClothing.mjs`) keep separate catalogs for independent deployment; backend tests verify they match the shipped assets. Starter image paths resolve on the client origin, so they also work with a separately hosted API.

### Replacing defaults in existing accounts

Run the reusable migration from `server/`. It defaults to a **dry run** against `.env.local`; the selected file must explicitly contain `MONGODB_URI`. Choose one account or all accounts:

```bash
npm run migrate:defaults -- --username nayef
npm run migrate:defaults -- --username nayef --apply
npm run migrate:defaults -- --all
npm run migrate:defaults -- --all --apply
```

Only exact matches for an original default's name, type, color, and image URL qualify. Uploaded pieces, including uploads with the same names as defaults, are preserved. Replacement defaults retain their item IDs and favorites when possible, preserving saved outfits. The three old hats and ring have no replacement; their references are removed from the wardrobe and saved outfits. No outfits, clothing documents, or hosted images are deleted.

Accounts with remaining legacy defaults receive the complete new set without duplicating defaults they already have. Accounts without recognized legacy defaults are skipped. Applied migrations are recorded in MongoDB's `defaultclothingmigrations` collection and can be rerun safely. Pending runs resume their recorded plan; concurrent edits cause the script to stop instead of overwriting user changes.

Before account changes, the migration saves originals and its plan in the journal and an ignored `server/migration-backups/<host>-<database>/` directory. Backups exclude passwords. Configured Redis inventory and outfit caches are cleared after migration, using the same `.env` fallback as the local API.

For a later hosted rollout, deploy the new client assets first. Use the hosted environment file explicitly. Applying a hosted migration also requires checking that the client serves every new image:

```bash
npm run migrate:defaults -- --env-file .env --all
npm run migrate:defaults -- --env-file .env --all --apply --asset-origin https://www.malabis.io
```

Migration unit tests run with `npm test`. To include MongoDB integration tests in PowerShell:

```powershell
$env:MIGRATION_TEST_MONGODB_URI = 'mongodb://127.0.0.1:27017/malabis'
try { npm test } finally { Remove-Item Env:MIGRATION_TEST_MONGODB_URI }
```

Integration tests create and remove a separate temporary database; existing accounts are not used as fixtures.

### 4. Run the app

In one terminal:

```bash
cd server
npm run dev
```

In another terminal:

```bash
cd client
npm run dev
```

Open:

- Client: <http://localhost:5173>
- API: <http://localhost:3000>
- Health check: <http://localhost:3000/api/health>

The health endpoint returns MongoDB connectivity and Redis status. It responds with `503` when MongoDB is disconnected.

## Application routes

- `/` - Landing page
- `/login` - Login
- `/signup` - Account creation
- `/dashboard` - Wardrobe overview
- `/clothes` - Clothing management
- `/outfits` - Saved outfits and manual outfit builder
- `/generator` - Generated outfit combinations
- `/account` - Profile settings

## API overview

All wardrobe, outfit, generator, and profile endpoints require an authenticated session.

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/status`
- `POST /api/auth/update-profile`

### Clothing

- `GET /api/clothing`
- `GET /api/clothing/inventory`
- `POST /api/clothing`
- `POST /api/clothing/upload`
- `PATCH /api/clothing/:id/favorite`
- `DELETE /api/clothing/:id`

Uploads use the multipart field `image`, accept image MIME types, and are limited to 5 MB. The optional multipart field `removeBackground` controls Cloudinary background removal.

### Outfits

- `GET /api/outfits`
- `POST /api/outfits`
- `PATCH /api/outfits/:id/favorite`
- `DELETE /api/outfits/:id`

### Generator

- `POST /api/generator/generate`

The generator accepts selected clothing types, optional locked inventory item IDs, and an accessory count from 0 through 5.

## Scripts

Run these commands from the relevant package directory.

### Client (`client/`)

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build in dist/
npm run preview   # Preview the production build
npm run lint      # Run ESLint
```

### Server (`server/`)

```bash
npm run dev            # Start the API with nodemon
npm start              # Start the API with Node.js
npm test               # Run backend tests serially
npm run test:coverage  # Run backend tests with coverage
npm run migrate:defaults -- --all  # Preview an existing-account defaults migration
```

## Deployment

The repository includes separate Vercel configurations in `client/vercel.json` and `server/vercel.json`.

1. Create a Vercel project with `client` as its root directory. Configure `VITE_API_BASE_URL` if the API is on another origin.
2. Create a second Vercel project with `server` as its root directory.
3. Add the server environment variables in Vercel. Production requires `MONGODB_URI` and `SESSION_SECRET`; image uploads also require the three Cloudinary variables.
4. If the deployed client origin is not one of the server's built-in allowed origins, add it to `CLIENT_ORIGINS`.

Never commit `.env` files or production credentials.
