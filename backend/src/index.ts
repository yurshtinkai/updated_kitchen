import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/admin/signin', authRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/inventory', inventoryRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/orders', customerOrdersRoutes);

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

