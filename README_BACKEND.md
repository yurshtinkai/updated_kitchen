# Backend Setup Guide

This project now includes a backend API built with Node.js, Express, TypeScript, Sequelize ORM, and MySQL.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server installed and running
- npm or yarn

## Database Setup

1. Make sure MySQL is running on your system
2. Update the database configuration in `backend/.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=chox_food_ordering
   DB_USER=root
   DB_PASSWORD=your_password
   ```

## Installation & Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
npm run backend:install

# Or install manually
cd backend
npm install
```

### 2. Create Database

```bash
# Create the database in MySQL
mysql -u root -p
CREATE DATABASE chox_food_ordering;
```

### 3. Run Migrations

```bash
npm run backend:migrate

# Or manually
cd backend
npm run migrate
```

### 4. Seed Database

```bash
npm run backend:seed

# Or manually
cd backend
npm run seed
```

This will create:
- Default admin user: username=`admin`, password=`admin123`
- Sample products
- Sample inventory items

## Running the Application

### Development Mode

Run both frontend and backend:
```bash
npm run dev
```

Or run them separately:

**Frontend only:**
```bash
npm start
```

**Backend only:**
```bash
npm run backend:dev
```

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Build the backend:
```bash
npm run backend:build
```

3. Start the backend:
```bash
cd backend
npm start
```

## API Endpoints

All admin endpoints require authentication (Bearer token).

### Authentication
- `POST /api/admin/signin` - Admin login

### Reports
- `GET /api/admin/reports/sales` - Sales reports with charts
- `GET /api/admin/reports/orders` - Orders reports  
- `GET /api/admin/reports/inventory` - Inventory reports

### Orders
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get single order
- `POST /api/admin/orders` - Create order
- `PUT /api/admin/orders/:id` - Update order
- `DELETE /api/admin/orders/:id` - Delete order

### Inventory
- `GET /api/admin/inventory` - Get all inventory
- `GET /api/admin/inventory/:id` - Get single item
- `POST /api/admin/inventory` - Add inventory item
- `PUT /api/admin/inventory/:id` - Update inventory
- `PUT /api/admin/inventory/:id/add-quantity` - Add quantity
- `DELETE /api/admin/inventory/:id` - Delete item

## Admin Access

Visit: `http://localhost:3000/admin/signin`

Default credentials:
- Username: `admin`
- Password: `admin123`

## Environment Variables

Create a `.env` file in the `backend` directory:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chox_food_ordering
DB_USER=root
DB_PASSWORD=

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

