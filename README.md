# FoodHub - Professional Food & Beverage Ordering System

A modern, responsive food ordering system with a comprehensive admin panel, built with React frontend and Node.js/Express/TypeScript backend.

## ✨ Features

### Frontend (React)
- 🍽️ Menu Management - Category filtering, rich item display
- 🛒 Shopping Cart - Add/remove items, real-time updates
- 📋 Order Processing - Customer details, special instructions
- 🎨 Professional Design - Tailwind CSS, responsive layout

### Backend (Node.js + Express + TypeScript)
- 🔐 JWT Authentication - Secure admin login
- 💾 MySQL Database - Sequelize ORM
- 📊 Sales Reports - Charts and analytics
- 📦 Orders Management - CRUD operations
- 📋 Inventory Management - Stock tracking
- 🚀 RESTful API - Well-organized endpoints

### Admin Panel
- **Sales Reports** - Line charts, pie charts, statistics
- **Orders Management** - Filter, add, edit, delete orders
- **Inventory Management** - Track supplies, low stock alerts

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL Server
- npm

### 1. Install Dependencies
```bash
npm install
npm run backend:install
```

### 2. Configure Database
Create `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chox_food_ordering
DB_USER=root
DB_PASSWORD=root
JWT_SECRET=chox-admin-secret-key-2024
PORT=3001
NODE_ENV=development
```

### 3. Create MySQL Database
```sql
CREATE DATABASE chox_food_ordering;
```

### 4. Setup Database
```bash
npm run backend:migrate
npm run backend:seed
```

### 5. Start Development
```bash
npm run dev
```

### 6. Access Application
- **Frontend:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/signin
  - Username: `admin`
  - Password: `admin123`

## 📁 Project Structure

```
CHOX/                          # Frontend root
├── src/                       # React components
│   └── components/
│       └── admin/            # Admin panel UI
├── public/                    # Static assets
├── build/                     # Production build
│
└── backend/                   # Backend API
    ├── src/
    │   ├── index.ts           # Development server
    │   ├── routes/            # API routes
    │   ├── models/           # Database models
    │   └── database/         # Migrations & seeds
    ├── server.js              # Production server ⭐
    └── .env                   # Database config
```

## 🔧 Available Commands

### Development
```bash
npm run dev                    # Run both frontend & backend
npm start                      # Frontend only (port 3000)
npm run backend:dev           # Backend only (port 3001)
```

### Production
```bash
npm run build                  # Build frontend
npm run backend:build         # Build backend TypeScript
npm run serve                 # Start production server
```

### Database
```bash
npm run backend:migrate       # Run migrations
npm run backend:seed          # Seed database
```

## 🎨 Admin Panel Features

### Sales Reports (`/admin/reports/sales`)
- 📊 Line graph for sales trends (weekly/monthly/yearly/all time)
- 🥧 Pie chart showing top-selling products
- 📈 Statistics cards (total sales, orders, average order value)
- 📄 Paginated sales table (30 per page)

### Orders Reports (`/admin/reports/orders`)
- 📋 Orders table with complete details
- 🔍 Filter by Order ID, customer name, and date range
- ➕ Manually add new orders
- ✏️ Edit existing orders
- 🗑️ Delete orders
- 📄 Pagination (30 per page)

### Inventory Reports (`/admin/reports/inventory`)
- 📦 Inventory items with stock levels
- 🔴 Low stock items highlighted automatically
- ➕ Add new supplies
- 📝 Add quantity to existing items
- ✏️ Edit inventory items
- 🗑️ Delete items
- 📄 Pagination (30 per page)

## 🔐 API Endpoints

### Authentication
- `POST /api/admin/signin` - Admin login

### Reports
- `GET /api/admin/reports/sales` - Sales reports with charts
- `GET /api/admin/reports/orders` - Orders reports
- `GET /api/admin/reports/inventory` - Inventory reports

### Orders
- `GET /api/admin/orders` - List all orders
- `POST /api/admin/orders` - Create order
- `PUT /api/admin/orders/:id` - Update order
- `DELETE /api/admin/orders/:id` - Delete order

### Inventory
- `GET /api/admin/inventory` - List all items
- `POST /api/admin/inventory` - Add item
- `PUT /api/admin/inventory/:id` - Update item
- `PUT /api/admin/inventory/:id/add-quantity` - Add quantity
- `DELETE /api/admin/inventory/:id` - Delete item

## 🛠️ Technology Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Fetch API

### Backend
- Node.js & Express
- TypeScript
- Sequelize ORM
- MySQL
- JWT Authentication
- bcryptjs

## 📚 Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - File structure
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details

## 🎯 Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## 📝 License

This project is licensed under the MIT License.
