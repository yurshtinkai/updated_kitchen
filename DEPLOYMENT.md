# Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
npm run backend:install
```

### 2. Set Up Database
```bash
# Run migrations
npm run backend:migrate

# Seed data
npm run backend:seed
```

### 3. Development
```bash
# Run both frontend and backend
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin/signin
- Credentials: admin / admin123

### 4. Production Build

**Step 1: Build Frontend**
```bash
npm run build
```

**Step 2: Build Backend**
```bash
npm run backend:build
```

**Step 3: Start Production Server**
```bash
cd backend
npm start
```

The server will:
- Serve API at `/api/*`
- Serve React app at `/*`
- Run on port 3000 (or PORT env variable)

## Environment Setup

### Backend (.env)
Create `backend/.env`:
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

### Production (.env)
For production, update:
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

## Structure

```
CHOX/                       # Frontend root
├── src/                    # React source code
├── public/                 # Static assets
├── build/                  # Production build (generated)
└── backend/                # Backend API
    ├── src/
    │   ├── index.ts       # Main server (serves both API and React)
    │   ├── routes/        # API endpoints
    │   ├── models/        # Database models
    │   └── database/      # Migrations and seeds
    └── .env              # Database config
```

## NPM Scripts

### Root Level
- `npm start` - Frontend dev server
- `npm run build` - Build React for production
- `npm run serve` - Start production server (backend)
- `npm run dev` - Run both in development

### Backend Level
- `npm run dev` - Backend dev server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database

## CORS Configuration

**Development:** 
- Frontend: localhost:3000
- Backend: localhost:3001
- CORS allows: localhost:3000 → localhost:3001

**Production:**
- Single server handles both
- No CORS needed

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE chox_food_ordering;
```

2. Update `backend/.env` with your credentials

3. Run migrations:
```bash
npm run backend:migrate
```

4. Seed data:
```bash
npm run backend:seed
```

## Troubleshooting

### Port conflicts
If ports are in use:
- Frontend: Change `PORT` in `.env`
- Backend: Change `PORT` in `backend/.env`

### Database connection
Check `backend/.env` credentials match your MySQL setup

### Module not found
Run:
```bash
npm install
npm run backend:install
```

## Production Deployment

### Steps:
1. Build frontend: `npm run build`
2. Build backend: `npm run backend:build`
3. Set `NODE_ENV=production` in backend/.env
4. Start server: `cd backend && npm start`
5. Server runs on port specified in `.env` (default: 3000)

### What Gets Served:
- `http://yourserver/api/*` → API endpoints
- `http://yourserver/*` → React app

Both served by single Express server!

