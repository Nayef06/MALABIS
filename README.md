# MALABIS - Wardrobe Organizer & Outfit Generator

MALABIS is a full-stack web app that helps you keep your wardrobe in check and lets you generate new outfit ideas. Upload your clothes, manage them in one place, and get AI-based outfit suggestions to level up your style.

## 🚀 Features

- **Wardrobe Management** – Upload, view, and organize your clothes  
- **AI Outfit Suggestions** – Get automatically generated outfit combos  
- **User Auth** – Secure login/signup with session handling  
- **Responsive UI** – Works smoothly on both desktop and mobile  
- **Cloud Image Storage** – Integrated with Cloudinary  
- **Persistent Sessions** – Managed with MongoDB and Express sessions  

## 🛠️ Tech Stack

### Frontend
- **React 18** – Core framework  
- **React Router DOM** – Routing  
- **React Draggable** – Drag-and-drop for clothing items  
- **Vite** – Fast build/dev tool  
- **CSS3** – Custom styles + responsive design  

### Backend
- **Node.js + Express** – Server setup and APIs  
- **MongoDB (Mongoose)** – Database  
- **Passport.js** – Auth middleware  
- **Cloudinary** – Image hosting  
- **Multer** – File uploads  
- **bcrypt** – Password hashing  
- **Express Session** – Session management  

## 📁 Project Structure

```
MALABIS/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Main pages
│       ├── assets/         # Images, icons, etc.
│       └── App.jsx         # Root component
├── server/                 # Express backend
│   └── src/
│       ├── models/         # DB models
│       ├── routes/         # API routes
│       ├── strategies/     # Passport auth
│       ├── utils/          # Helper functions
│       └── index.mjs       # Entry point
```

## 🧰 Getting Started

### Prereqs

- Node.js (v16+)
- MongoDB Atlas or local Mongo instance
- Cloudinary account

### Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd MALABIS
   ```

2. **Install dependencies**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in `/server` with:

   ```env
   MONGODB_URI=your_mongo_uri
   SESSION_SECRET=your_secret
   COOKIE_SECRET=your_cookie_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   PORT=3000
   ```

4. **Run the app locally**
   ```bash
   # Backend
   cd server
   npm run dev

   # Frontend
   cd ../client
   npm run dev
   ```

5. **Open it up**
   - Frontend: http://localhost:5173  
   - Backend API: http://localhost:3000  

## 📱 Pages

- `/` – Landing (signup/login)  
- `/login` – Login  
- `/signup` – Create account  
- `/dashboard` – Main view  
- `/clothes` – Add/view clothes  
- `/outfits` – Saved outfits  
- `/generator` – Outfit generator  
- `/account` – Account settings  

## 🔌 API Overview

### Auth
- `POST /api/auth/signup` – Register  
- `POST /api/auth/login` – Login  
- `POST /api/auth/logout` – Logout  
- `GET /api/auth/status` – Check if user is logged in  

### Clothing
- `GET /api/clothing` – Get all items  
- `POST /api/clothing` – Upload a new item  
- `DELETE /api/clothing/:id` – Delete item  

### Outfits
- `GET /api/outfits` – Get saved outfits  
- `POST /api/outfits` – Save new outfit  
- `DELETE /api/outfits/:id` – Remove outfit  

### Outfit Generator
- `POST /api/generator` – Generate outfit ideas  

## 📄 License

MIT

## 🙋‍♂️ Questions?

Feel free to open an issue if anything breaks or you're stuck!

---
