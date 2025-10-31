import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './config/database';
import authRoutes from './routes/auth';
import reportsRoutes from './routes/reports';
import ordersRoutes from './routes/orders';
import inventoryRoutes from './routes/inventory';
import productsRoutes from './routes/products';
import customerOrdersRoutes from './routes/customer-orders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing - only for JSON and urlencoded, NOT for multipart/form-data (handled by multer)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Determine the correct uploads directory path
// When running with ts-node, __dirname is backend/src
// When compiled, __dirname would be backend/dist
// Use resolve to get absolute path
const uploadsPath = path.resolve(__dirname, '../uploads');
console.log('📁 Serving static files from:', uploadsPath);
console.log('📁 __dirname is:', __dirname);

// Verify the directory exists
const fs = require('fs');
if (!fs.existsSync(uploadsPath)) {
  console.error('❌ Uploads directory does not exist:', uploadsPath);
  // Try to create it
  try {
    fs.mkdirSync(uploadsPath, { recursive: true });
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
  const fs = require('fs');
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
  const findFile = (searchFilename: string): string | null => {
    const directPath = path.resolve(receiptsDir, searchFilename);
    if (fs.existsSync(directPath)) {
      return directPath;
    }
    
    // Try case-insensitive search
    if (fs.existsSync(receiptsDir)) {
      const files = fs.readdirSync(receiptsDir);
      const found = files.find((f: string) => f.toLowerCase() === searchFilename.toLowerCase());
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
  // Ensure we're serving as binary/image, not HTML
  res.sendFile(filePath, (err: any) => {
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
  const fs = require('fs');
  const uploadsDir = path.join(uploadsPath, 'receipts');
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      uploadsPath,
      __dirname,
      receiptsPath: uploadsDir,
      filesCount: files.length,
      files: files.slice(0, 5) // First 5 files
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, uploadsPath, __dirname, receiptsPath: uploadsDir });
  }
});

// API Routes
app.use('/api/admin/signin', authRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/orders', customerOrdersRoutes);

// 404 handler for undefined routes - return JSON, NOT HTML
app.use((req, res) => {
  // Don't return HTML for any route
  res.status(404).type('json').json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Database connection test
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

