# Complete Setup Guide

This guide will help you set up both the frontend and backend for this food ordering system with admin panel.

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL Server** - [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)

## Step-by-Step Setup

### 1. Install Project Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run backend:install
```

Or install them separately:
```bash
# Frontend
cd .
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Set Up MySQL Database

1. Start your MySQL server
2. Create the database:

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE chox_food_ordering;

# Exit MySQL
exit;
```

Or use MySQL Workbench or any MySQL client to create the database.

### 3. Configure Backend Environment

Edit `backend/.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chox_food_ordering
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=chox-admin-secret-key-2024
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
```

### 4. Run Database Migrations

This will create all the necessary tables:

```bash
npm run backend:migrate
```

### 5. Seed the Database

This will create:
- Default admin user (username: `admin`, password: `admin123`)
- Sample products
- Sample inventory items

```bash
npm run backend:seed
```

### 6. Start the Development Servers

**Option 1: Run both frontend and backend together:**
```bash
npm run dev
```

**Option 2: Run them separately in different terminals:**

Terminal 1 (Frontend):
```bash
npm start
```

Terminal 2 (Backend):
```bash
npm run backend:dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/signin
  - Username: `admin`
  - Password: `admin123`

## Admin Panel Features

### Sales Reports
- View sales data with charts
- Filter by period (weekly, monthly, yearly, all time)
- Line chart showing sales over time
- Pie chart showing top-selling products
- Paginated sales table (30 per page)

### Orders Reports
- View all orders with pagination (30 per page)
- Filter by Order ID
- Filter by customer name and date range
- Add new orders manually
- Delete orders

### Inventory Reports
- View all inventory items
- Low stock items highlighted in red at the top
- Add new supplies
- Add quantity to existing items (with confirmation)
- Delete items
- Pagination (30 per page)

## Production Build

### 1. Build Frontend
```bash
npm run build
```

### 2. Build Backend
```bash
npm run backend:build
```

### 3. Start Backend Server
```bash
cd backend
npm start
```

The production server will serve both the API and the React app on port 3000.

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Make sure MySQL is running
2. Check your credentials in `backend/.env`
3. Verify the database exists: `SHOW DATABASES;`

### Port Already in Use

If port 3000 or 3001 is already in use:

- For frontend: Edit `.env` in root directory and add `PORT=3002`
- For backend: Edit `backend/.env` and change `PORT=3002`

### Module Not Found Errors

Make sure you've installed all dependencies:
```bash
npm install
npm run backend:install
```

## Project Structure

```
CHOX/
├── backend/              # Backend API (TypeScript + Express + Sequelize)
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── models/      # Sequelize models
│   │   ├── routes/      # API routes
│   │   ├── middleware/ # Auth middleware
│   │   └── index.ts     # Entry point
│   └── package.json
├── src/                  # Frontend React app
│   ├── components/
│   │   ├── admin/        # Admin panel components
│   │   └── ...
│   └── App.js
├── build/                # Production build
└── package.json
```

## API Endpoints

All admin endpoints require authentication (Bearer token):

### Authentication
- `POST /api/admin/signin` - Login

### Reports
- `GET /api/admin/reports/sales?period={weekly|monthly|yearly|all}&page={n}&limit={n}` - Sales reports
- `GET /api/admin/reports/orders?page={n}&limit={n}&orderId={n}&customerName={name}&startDate={date}&endDate={date}` - Orders
- `GET /api/admin/reports/inventory?page={n}&limit={n}` - Inventory

### Orders
- `GET /api/admin/orders` - List all orders
- `POST /api/admin/orders` - Create order
- `PUT /api/admin/orders/:id` - Update order
- `DELETE /api/admin/orders/:id` - Delete order

### Inventory
- `GET /api/admin/inventory` - List all inventory
- `POST /api/admin/inventory` - Add item
- `PUT /api/admin/inventory/:id` - Update item
- `PUT /api/admin/inventory/:id/add-quantity` - Add quantity
- `DELETE /api/admin/inventory/:id` - Delete item

## Support

For issues or questions, please check the code comments or refer to the documentation.

