// Production server entry point
// This file serves both the React app and the API

const fs = require('fs');
const path = require('path');
const express = require('express');

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist folder not found!');
  console.error('📦 Please build the backend first:');
  console.error('   npm run build');
  console.error('   or');
  console.error('   npm run dev (for development)');
  process.exit(1);
}

require('dotenv').config();
const app = express();

// Middleware
app.use(require('cors')({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import compiled routes (handle CommonJS exports)
const getDefaultExport = (module) => {
  if (!module) return null;
  // Handle different export styles
  if (module.default && typeof module.default === 'function') return module.default;
  if (typeof module === 'function') return module;
  return module;
};

const authRoutes = getDefaultExport(require('./dist/routes/auth'));
const reportsRoutes = getDefaultExport(require('./dist/routes/reports'));
const ordersRoutes = getDefaultExport(require('./dist/routes/orders'));
const inventoryRoutes = getDefaultExport(require('./dist/routes/inventory'));
const productsRoutes = getDefaultExport(require('./dist/routes/products'));
const customerOrdersRoutes = getDefaultExport(require('./dist/routes/customer-orders'));

// Debug: Check if routes are loaded
console.log('Route checks:', {
  auth: typeof authRoutes,
  reports: typeof reportsRoutes,
  orders: typeof ordersRoutes,
  inventory: typeof inventoryRoutes,
  products: typeof productsRoutes,
});

// API Routes
app.use('/api/admin', authRoutes);  // authRoutes already has /signin
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/orders', customerOrdersRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Handle all other routes by serving index.html (SINGLE PAGE APP)
// BUT skip /api routes
app.get('*', (req, res, next) => {
  // Skip API routes - they should have been handled by API routes above
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Import and test database connection
const sequelizeDefault = require('./dist/config/database');
const sequelize = sequelizeDefault.default || sequelizeDefault;

sequelize
  .authenticate()
  .then(() => {
    console.log('✓ Database connection established successfully.');
  })
  .catch((err) => {
    console.error('✗ Unable to connect to the database:', err);
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Server is running!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('🎯 API: http://localhost:' + PORT + '/api/*');
  console.log('📱 Frontend: http://localhost:' + PORT + '/*');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;

