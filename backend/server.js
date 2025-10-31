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

// CRITICAL: Serve receipt images - MUST come before React app static files
// Determine the correct uploads directory path
// When running server.js, __dirname is backend
const uploadsPath = path.resolve(__dirname, 'uploads');
console.log('📁 Serving receipt images from:', uploadsPath);
console.log('📁 __dirname is:', __dirname);

// Verify the directory exists
if (!fs.existsSync(uploadsPath)) {
  console.error('❌ Uploads directory does not exist:', uploadsPath);
  // Try to create it
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
    fs.mkdirSync(path.join(uploadsPath, 'receipts'), { recursive: true });
    console.log('✅ Created uploads directory:', uploadsPath);
  } catch (err) {
    console.error('❌ Failed to create uploads directory:', err);
  }
} else {
  console.log('✅ Uploads directory exists');
  // List files in receipts subdirectory
  const receiptsPath = path.join(uploadsPath, 'receipts');
  if (fs.existsSync(receiptsPath)) {
    const files = fs.readdirSync(receiptsPath);
    console.log(`📄 Found ${files.length} receipt files`);
  }
}

// Middleware to log ALL /uploads requests for debugging
app.use('/uploads', (req, res, next) => {
  console.log('🌐 /uploads request received:', req.method, req.originalUrl);
  console.log('🌐 Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
  next();
});

// CRITICAL: Specific route to serve receipt images - MUST come before static middleware
app.get('/uploads/receipts/:filename', (req, res, next) => {
  let filename = req.params.filename;
  
  console.log('🔍 Request for receipt:', filename);
  console.log('📂 Uploads path:', uploadsPath);
  console.log('📂 Request path:', req.path);
  console.log('📂 Request originalUrl:', req.originalUrl);
  
  // Security: prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    console.error('❌ Invalid filename (security check failed):', filename);
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  // Try multiple filename patterns (with and without "receipt-" prefix, and case variations)
  const receiptsDir = path.resolve(uploadsPath, 'receipts');
  let filePath = path.resolve(receiptsDir, filename);
  
  // Helper function to find file (case-insensitive)
  const findFile = (searchFilename) => {
    const directPath = path.resolve(receiptsDir, searchFilename);
    if (fs.existsSync(directPath)) {
      return directPath;
    }
    
    // Try case-insensitive search
    if (fs.existsSync(receiptsDir)) {
      const files = fs.readdirSync(receiptsDir);
      const found = files.find((f) => f.toLowerCase() === searchFilename.toLowerCase());
      if (found) {
        return path.resolve(receiptsDir, found);
      }
    }
    
    return null;
  };
  
  // If file doesn't exist, try adding "receipt-" prefix
  if (!fs.existsSync(filePath) && !filename.startsWith('receipt-')) {
    const filenameWithPrefix = `receipt-${filename}`;
    const foundPath = findFile(filenameWithPrefix);
    if (foundPath) {
      console.log('✅ Found file with prefix:', filenameWithPrefix);
      filePath = foundPath;
      filename = path.basename(foundPath);
    }
  }
  
  // If still not found, try removing "receipt-" prefix
  if (!fs.existsSync(filePath) && filename.startsWith('receipt-')) {
    const filenameWithoutPrefix = filename.replace(/^receipt-/i, '');
    const foundPath = findFile(filenameWithoutPrefix);
    if (foundPath) {
      console.log('✅ Found file without prefix:', filenameWithoutPrefix);
      filePath = foundPath;
      filename = path.basename(foundPath);
    }
  }
  
  // Final check - try exact match first
  if (!fs.existsSync(filePath)) {
    const foundPath = findFile(filename);
    if (foundPath) {
      filePath = foundPath;
      filename = path.basename(foundPath);
    }
  }
  
  console.log('📂 Final file path:', filePath);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error('❌ Receipt file not found:', filePath);
    const dirFiles = fs.existsSync(receiptsDir) 
      ? fs.readdirSync(receiptsDir)
      : [];
    console.error('❌ Files in directory:', dirFiles);
    console.error('❌ Requested filename:', req.params.filename);
    // Return 404 with JSON, NOT HTML
    return res.status(404).type('json').json({ 
      error: 'Receipt image not found', 
      requestedFilename: req.params.filename,
      filePath, 
      availableFiles: dirFiles 
    });
  }
  
  console.log('✅ Serving receipt file:', filePath);
  
  // Set proper headers including CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') {
    res.setHeader('Content-Type', 'image/png');
  } else if (ext === '.jpg' || ext === '.jpeg') {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (ext === '.gif') {
    res.setHeader('Content-Type', 'image/gif');
  } else if (ext === '.webp') {
    res.setHeader('Content-Type', 'image/webp');
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  
  // Use absolute path with sendFile - CRITICAL for serving files
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('❌ Error sending file:', err);
      console.error('❌ Error details:', {
        code: err.code || 'unknown',
        message: err.message || 'Unknown error',
        syscall: err.syscall || 'unknown',
        path: err.path || 'unknown',
        filePath: filePath
      });
      if (!res.headersSent) {
        return res.status(500).type('json').json({ error: 'Error serving file', message: err.message || 'Unknown error' });
      }
    } else {
      console.log('✅ File sent successfully:', filename);
      console.log('✅ Content-Type:', res.getHeader('Content-Type'));
      console.log('✅ File size:', fs.statSync(filePath).size, 'bytes');
    }
  });
});

// Serve uploaded files (fallback for other uploads)
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Set proper content type for images
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Test route to verify file serving
app.get('/test-uploads', (req, res) => {
  const uploadsDir = path.join(uploadsPath, 'receipts');
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      uploadsPath,
      __dirname,
      receiptsPath: uploadsDir,
      filesCount: files.length,
      files: files.slice(0, 10) // First 10 files
    });
  } catch (err) {
    res.status(500).json({ error: err.message, uploadsPath, __dirname, receiptsPath: uploadsDir });
  }
});

// Serve static files from the React app (but skip /uploads and /api routes)
const reactStatic = express.static(path.join(__dirname, '../build'));
app.use((req, res, next) => {
  // Don't serve React static files for API or uploads routes
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  return reactStatic(req, res, next);
});

// Handle all other routes by serving index.html (SINGLE PAGE APP)
// BUT skip /api and /uploads routes
app.get('*', (req, res, next) => {
  // Skip API routes - they should have been handled by API routes above
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // Skip uploads routes - they should have been handled above
  if (req.path.startsWith('/uploads')) {
    return res.status(404).type('json').json({ error: 'File not found' });
  }
  // Only serve index.html for non-API, non-uploads routes
  const indexPath = path.join(__dirname, '../build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend build not found. Please run: npm run build in the frontend directory' });
  }
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

