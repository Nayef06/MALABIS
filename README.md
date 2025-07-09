# MALABIS - Smart Wardrobe Organizer & Outfit Generator

MALABIS is a full-stack web application that revolutionizes wardrobe management through intelligent outfit generation. Upload your clothes, organize them systematically, and discover new outfit combinations that elevate your personal style.

## 🚀 Features

### Core Functionality
- **Smart Wardrobe Management** – Upload, categorize, and organize your clothing items with automatic background removal
- **Intelligent Outfit Generator** – Get smart outfit suggestions based on your wardrobe
- **Advanced Item Locking** – Lock specific items in outfit generation for personalized combinations
- **Favorites System** – Mark and organize your favorite clothing items
- **Responsive Design** – Seamless experience across desktop and mobile devices

### Technical Features
- **Background Removal** – Automatic background removal for clean clothing uploads
- **Image Optimization** – Automatic resizing and compression for optimal performance
- **Cloud Storage** – Secure image hosting with Cloudinary integration
- **Session Management** – Persistent user sessions with MongoDB
- **Real-time Updates** – Dynamic UI updates without page refreshes

### User Experience
- **Modern UI/UX** – Beautiful, intuitive interface with smooth animations
- **Mobile-First Design** – Optimized for mobile devices with responsive layouts
- **Drag & Drop Upload** – Easy file upload with visual feedback
- **Smart Categorization** – Automatic clothing type detection and organization
- **Color Management** – Track and filter items by color

## 🛠️ Tech Stack

### Frontend
- **React 18** – Modern React with hooks and functional components
- **React Router DOM v6** – Client-side routing with nested routes
- **Vite** – Lightning-fast build tool and development server
- **CSS3** – Custom styling with responsive design and animations

### Backend
- **Node.js + Express** – RESTful API server with middleware
- **MongoDB + Mongoose** – NoSQL database with ODM
- **Passport.js** – Authentication middleware with local strategy
- **Cloudinary** – Cloud image storage and transformation
- **Multer** – File upload handling
- **Sharp** – Image processing and optimization
- **bcrypt** – Secure password hashing
- **Express Session** – Session management with MongoDB store
- **Express Validator** – Input validation and sanitization

### Deployment
- **Vercel** – Frontend and backend deployment
- **MongoDB Atlas** – Cloud database hosting
- **Cloudinary** – Cloud image hosting and CDN

## 📁 Project Structure

```
MALABIS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── Navbar.jsx  # Navigation component
│   │   ├── pages/          # Main application pages
│   │   │   ├── Auth.css    # Authentication styles
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ClothesPage.jsx
│   │   │   ├── OutfitsPage.jsx
│   │   │   ├── GeneratorPage.jsx
│   │   │   └── AccountPage.jsx
│   │   ├── assets/         # Images and static files
│   │   ├── api.js          # API client configuration
│   │   ├── App.jsx         # Root component with routing
│   │   ├── LandingPage.jsx # Landing page component
│   │   └── main.jsx        # Application entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vercel.json         # Vercel deployment config
├── server/                 # Express backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   │   ├── user.mjs
│   │   │   ├── clothingItem.mjs
│   │   │   └── outfit.mjs
│   │   ├── routes/         # API route handlers
│   │   │   ├── auth.mjs
│   │   │   ├── clothing.mjs
│   │   │   ├── outfits.mjs
│   │   │   └── generator.mjs
│   │   ├── strategies/     # Passport authentication
│   │   │   └── local-strategy.mjs
│   │   ├── utils/          # Helper functions
│   │   │   ├── cloudinary.mjs
│   │   │   ├── removeBackground.mjs
│   │   │   ├── defaultClothing.mjs
│   │   │   ├── validationSchemas.mjs
│   │   │   └── helpers.mjs
│   │   └── index.mjs       # Server entry point
│   ├── api/                # Vercel serverless functions
│   │   ├── handler.mjs     # Main API handler
│   │   └── index.mjs       # Route aggregation
│   ├── package.json        # Backend dependencies
│   └── vercel.json         # Vercel deployment config
└── README.md
```

## 🧰 Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB Atlas** account or local MongoDB instance
- **Cloudinary** account for image hosting
- **Vercel** account for deployment (optional)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MALABIS
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   cd client && npm install
   
   # Backend dependencies
   cd ../server && npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the `/server` directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Session Management
   SESSION_SECRET=your_session_secret_key
   COOKIE_SECRET=your_cookie_secret_key
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # Start frontend development server (in new terminal)
   cd client
   npm run dev
   ```

5. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000

## 📱 Application Pages

### Public Pages
- **`/`** – Landing page with signup/login options
- **`/login`** – User authentication
- **`/signup`** – New user registration

### Protected Pages (Requires Authentication)
- **`/dashboard`** – Main dashboard overview
- **`/clothes`** – Wardrobe management and item upload
- **`/outfits`** – Saved outfit collections
- **`/generator`** – Smart outfit generation
- **`/account`** – User profile and settings

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` – User registration
- `POST /api/auth/login` – User login
- `POST /api/auth/logout` – User logout
- `GET /api/auth/status` – Check authentication status

### Clothing Management
- `GET /api/clothing` – Retrieve user's clothing items
- `POST /api/clothing` – Upload new clothing item
- `DELETE /api/clothing/:id` – Remove clothing item
- `PUT /api/clothing/:id/favorite` – Toggle favorite status

### Outfit Management
- `GET /api/outfits` – Get user's saved outfits
- `POST /api/outfits` – Save new outfit
- `DELETE /api/outfits/:id` – Remove saved outfit

### Outfit Generation
- `POST /api/generator` – Generate outfit suggestions
- `GET /api/generator/inventory` – Get user's clothing inventory

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables in Vercel dashboard

### Backend Deployment (Vercel)
1. Deploy the `server` directory as a separate Vercel project
2. Configure environment variables in Vercel dashboard
3. Set the main function to `api/handler.mjs`

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
SESSION_SECRET=your_production_session_secret
COOKIE_SECRET=your_production_cookie_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=production
```

## 🎨 Key Features in Detail

### Smart Wardrobe Management
- **Automatic Background Removal**: Upload clothing items with automatic background removal for clean, professional-looking images
- **Smart Categorization**: Items are automatically categorized by type (shirts, pants, shoes, etc.)
- **Color Tracking**: Each item's color is tracked and can be used for outfit generation
- **Favorites System**: Mark items as favorites for quick access and special consideration in outfit generation

### Smart Outfit Generator
- **Intelligent Suggestions**: Algorithm generates outfit combinations based on your wardrobe
- **Item Locking**: Lock specific items in place while generating variations for other pieces
- **Type Filtering**: Generate outfits based on specific clothing types
- **Accessory Management**: Control the number of accessories in generated outfits
- **Real-time Generation**: Instant outfit suggestions with smooth animations

### User Experience
- **Responsive Design**: Optimized for all device sizes with mobile-first approach
- **Smooth Animations**: Polished UI with smooth transitions and loading states
- **Drag & Drop**: Intuitive file upload with visual feedback
- **Real-time Updates**: Dynamic UI updates without page refreshes
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🔧 Development

### Available Scripts

**Frontend (client/)**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Backend (server/)**
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Code Structure
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Component Reusability**: Reusable React components with consistent styling
- **API Abstraction**: Centralized API client with error handling
- **Validation**: Comprehensive input validation on both frontend and backend

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

### Current Limitations
1. **Background Removal**: Only works with PNG file types. JPG/JPEG files will have a white background.
2. **Mobile Upload UI**: The clothing upload interface may extend beyond screen boundaries on some mobile devices, particularly smaller phones, making it impossible to click off or click upload.

### Workarounds
- For background removal: Convert images to PNG format before uploading
- For mobile upload issues: Use a larger device for optimal experience

## 🙋‍♂️ Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Check the code comments for detailed implementation details
- **Questions**: Open a discussion for general questions about the project

---

**MALABIS** - Transform your wardrobe into endless style possibilities! ✨
