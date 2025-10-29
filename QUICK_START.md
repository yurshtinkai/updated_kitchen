# Quick Start Guide

## Prerequisites Checklist
- [ ] Node.js installed (v14+)
- [ ] MySQL Server installed and running
- [ ] Git repository cloned

## Step 1: Install Dependencies (5 minutes)

Open terminal in the project root:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies  
npm run backend:install
```

## Step 2: Create MySQL Database (2 minutes)

Open MySQL command line or MySQL Workbench:

```sql
CREATE DATABASE chox_food_ordering;
```

## Step 3: Configure Backend (1 minute)

Create `backend/.env` file:

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

Replace `your_mysql_password` with your actual MySQL password.

## Step 4: Initialize Database (2 minutes)

```bash
# Run database migrations (creates tables)
npm run backend:migrate

# Seed with default data (creates admin user and sample data)
npm run backend:seed
```

This creates:
- Admin user: `admin` / `admin123`
- Sample products
- Sample inventory items

## Step 5: Start Development Servers (1 minute)

### Option A: Run both together
```bash
npm run dev
```

### Option B: Run separately (in different terminals)

Terminal 1:
```bash
npm start
```

Terminal 2:
```bash
npm run backend:dev
```

## Step 6: Access the Application

### Frontend (Customer View)
http://localhost:3000

### Admin Panel
http://localhost:3000/admin/signin

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

## Next Steps

1. **Browse the menu** at http://localhost:3000
2. **Login to admin** at http://localhost:3000/admin/signin
3. **Explore reports:**
   - Sales Reports: http://localhost:3000/admin/reports/sales
   - Orders Reports: http://localhost:3000/admin/reports/orders
   - Inventory Reports: http://localhost:3000/admin/reports/inventory

## Troubleshooting

### Error: "Cannot connect to database"

**Solution:**
1. Make sure MySQL is running
2. Check credentials in `backend/.env`
3. Verify database exists: `SHOW DATABASES;`

### Error: "Port 3000 already in use"

**Solution:**
1. Kill the process using the port
2. Or change port in `.env` file

### Module not found errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Backend not starting

**Solution:**
1. Check `backend/.env` exists and has correct values
2. Verify Node.js version: `node --version` (should be 14+)
3. Check backend logs for errors

## Default Data

After seeding, you'll have:

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Sample Products:** 19 items across 4 categories

**Sample Inventory:** 7 inventory items

## Production Deployment

When ready to deploy:

```bash
# Build frontend
npm run build

# Build backend  
npm run backend:build

# Start production server
cd backend
npm start
```

The production server serves both API and React app.

## Support

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

For implementation details, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

