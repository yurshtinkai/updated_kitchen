# Project Structure - Final Clean Setup

## Directory Structure

```
CHOX/
├── backend/                      # Backend API (TypeScript + Express + Sequelize)
│   ├── .env                      # Database configuration (git ignored)
│   ├── .gitignore               # Backend specific ignore rules
│   ├── nodemon.json             # Development auto-reload config
│   ├── package.json             # Backend dependencies
│   ├── tsconfig.json            # TypeScript configuration
│   └── src/
│       ├── config/
│       │   └── database.ts       # Sequelize DB configuration
│       ├── models/
│       │   ├── Admin.ts         # Admin user model
│       │   ├── Product.ts       # Product model
│       │   ├── Order.ts         # Order model
│       │   ├── OrderItem.ts     # Order items model
│       │   ├── Inventory.ts      # Inventory model
│       │   └── index.ts          # Model exports
│       ├── routes/
│       │   ├── auth.ts           # Authentication routes
│       │   ├── reports.ts        # Reports routes
│       │   ├── orders.ts         # Orders CRUD routes
│       │   ├── inventory.ts      # Inventory CRUD routes
│       │   └── products.ts        # Products routes
│       ├── middleware/
│       │   └── auth.ts           # JWT authentication
│       ├── database/
│       │   ├── migrate.ts        # Database migration
│       │   └── seed.ts           # Database seeding
│       └── index.ts              # Main server (serves both API and React app in production)
│
├── src/                          # Frontend React App
│   ├── components/
│   │   ├── admin/               # Admin panel components
│   │   │   ├── AdminSignin.js   # Login page
│   │   │   ├── AdminSignin.css
│   │   │   ├── AdminLayout.js   # Sidebar layout
│   │   │   ├── AdminLayout.css
│   │   │   ├── ProtectedRoute.js # Auth guard
│   │   │   ├── SalesReports.js   # Sales reports
│   │   │   ├── OrdersReports.js # Orders management
│   │   │   ├── InventoryReports.js # Inventory management
│   │   │   └── AdminReports.css # Shared admin styles
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── Homepage.js
│   │   ├── MenuPage.js
│   │   └── ... (other components)
│   ├── App.js                   # Main app with routes
│   ├── App.css
│   ├── index.js
│   └── index.css
│
├── public/                       # Static assets
├── build/                        # Production build (git ignored)
│
├── package.json                  # Root package.json with scripts
├── .gitignore                   # Git ignore rules
├── README.md                     # Main documentation
├── SETUP_GUIDE.md               # Setup instructions
├── QUICK_START.md               # Quick start guide
├── IMPLEMENTATION_SUMMARY.md    # Implementation details
└── PROJECT_STRUCTURE.md         # This file
```

## Key Points

### ✅ Clean Structure
- **Frontend files** are in the root `src/` directory (intended for React)
- **Backend files** are in `backend/` directory (intended for API)
- No redundant server files
- Backend handles both API and production React app serving

### 🎯 Communication Setup

**Development:**
- Frontend: `http://localhost:3000` (React dev server)
- Backend: `http://localhost:3001` (Express API)
- CORS configured to allow frontend → backend communication

**Production:**
- Single server on port 3000
- Backend serves both API (`/api/*`) and React app (`/*`)
- No separate servers needed

### 📝 NPM Scripts

**Root Level:**
```bash
npm start                    # Start frontend dev server
npm run build                # Build frontend for production
npm run serve                # Serve production (runs backend server)
npm run dev                  # Run both frontend and backend in development
```

**Backend:**
```bash
npm run backend:install      # Install backend dependencies
npm run backend:dev         # Start backend dev server
npm run backend:build       # Build backend
npm run backend:migrate     # Run database migrations
npm run backend:seed        # Seed database
```

### 🔧 How It Works

**Development Mode:**
1. Frontend dev server runs on port 3000
2. Backend API runs on port 3001
3. Frontend makes API calls to `http://localhost:3001/api/*`
4. CORS allows cross-origin requests

**Production Mode:**
1. Build frontend: `npm run build`
2. Build backend: `npm run backend:build`
3. Start backend: `cd backend && npm start`
4. Backend serves:
   - API routes: `/api/*` → Express API
   - Frontend routes: `/*` → React app
5. Single port, single server, everything works!

### 🛠️ Files Summary

**Removed (not needed):**
- ❌ `server.js` (root) - Deleted, handled by backend
- ❌ `backend/server.js` - Deleted, handled by backend/src/index.ts
- ❌ `backend/dist/` - Auto-generated, git ignored

**Kept (essential):**
- ✅ `backend/src/index.ts` - Main server serving both API and React
- ✅ All backend source files
- ✅ All frontend components
- ✅ Configuration files

### 🔐 Environment Variables

**Location:** `backend/.env`

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chox_food_ordering
DB_USER=root
DB_PASSWORD=root

JWT_SECRET=chox-admin-secret-key-2024
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
```

### 🎨 Admin Panel Features

- **Professional gradient UI** with modern design
- **Responsive layout** with sidebar navigation
- **Charts and graphs** for sales analytics
- **Filtering and pagination** on all tables
- **Modal forms** for adding/editing data
- **Confirmation dialogs** for destructive actions
- **Low stock highlighting** for inventory

### ✅ Final Verification

- ✅ Frontend and backend communicate via CORS
- ✅ Professional UI/UX implemented
- ✅ All unnecessary files removed
- ✅ Clean file structure
- ✅ Production-ready configuration
- ✅ Backend serves React app in production
- ✅ No redundant server files
