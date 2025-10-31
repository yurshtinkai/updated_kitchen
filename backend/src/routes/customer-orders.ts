import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import { uploadReceipt } from '../middleware/upload';
import crypto from 'crypto';

const router = Router();

// Generate unique tracking token
const generateTrackingToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

// Create customer order with receipt upload
router.post(
  '/',
  (req: Request, res: Response, next: any) => {
    uploadReceipt.single('receipt')(req, res, (err: any) => {
      if (err) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
        if (err.message === 'Only image files are allowed') {
          return res.status(400).json({ error: 'Only image files are allowed for receipt upload.' });
        }
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      console.log('🔵 === CUSTOMER ORDER ROUTE HIT ===');
      console.log('Request method:', req.method);
      console.log('Request URL:', req.url);
      console.log('Request headers:', req.headers['content-type']);
      console.log('Files received:', req.file ? { 
        filename: req.file.filename, 
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size 
      } : '❌ NO FILE');
      console.log('Request body keys:', Object.keys(req.body));
      console.log('Request body:', JSON.stringify(req.body, null, 2));

      if (!req.file) {
        console.error('ERROR: No file uploaded');
        return res.status(400).json({ error: 'Receipt image is required. Please upload a screenshot of your 50% downpayment receipt.' });
      }

      // Extract fields from FormData (all come as strings)
      const customerName = req.body.customerName?.trim();
      const customerEmail = req.body.customerEmail?.trim() || null;
      const customerPhone = req.body.customerPhone?.trim() || null;
      const deliveryAddress = req.body.deliveryAddress?.trim() || null;
      const totalAmount = req.body.totalAmount;
      const items = req.body.items;
      const specialInstructions = req.body.specialInstructions?.trim() || null;

      console.log('Extracted fields:', {
        customerName: customerName || 'MISSING',
        totalAmount: totalAmount || 'MISSING',
        items: items ? 'PRESENT' : 'MISSING',
        itemsType: typeof items,
        itemsPreview: items ? (typeof items === 'string' ? items.substring(0, 100) : JSON.stringify(items).substring(0, 100)) : 'N/A',
        allBodyKeys: Object.keys(req.body)
      });

      // Validate required fields
      if (!customerName || customerName === '') {
        return res.status(400).json({ error: 'Customer name is required' });
      }
      if (!totalAmount || totalAmount === '' || isNaN(parseFloat(totalAmount))) {
        return res.status(400).json({ error: 'Total amount must be a valid number' });
      }
      if (!items || items === '') {
        return res.status(400).json({ error: 'Order items are required' });
      }

      let parsedItems;
      try {
        parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      } catch {
        return res.status(400).json({ error: 'Invalid items format' });
      }

      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        return res.status(400).json({ error: 'At least one item is required' });
      }

      // Generate unique tracking token
      let trackingToken = generateTrackingToken();
      let exists = await Order.findOne({ where: { trackingToken } });
      while (exists) {
        trackingToken = generateTrackingToken();
        exists = await Order.findOne({ where: { trackingToken } });
      }

      // Save receipt path
      const receiptImage = `/uploads/receipts/${req.file.filename}`;

      // Create order
      const order = await Order.create({
        customerName,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        deliveryAddress: deliveryAddress || null,
        specialInstructions: specialInstructions || null,
        totalAmount: parseFloat(totalAmount),
        receiptImage,
        trackingToken,
        status: 'pending',
      });

      // Create order items
      for (const item of parsedItems) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        });
      }

      // Fetch complete order with items
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'Items',
          },
        ],
      });

      // Generate tracking URL
      const trackingUrl = `${req.protocol}://${req.get('host')}/track/${trackingToken}`;

      res.status(201).json({
        message: 'Order placed successfully',
        order: completeOrder,
        trackingUrl,
      });
    } catch (error: any) {
      console.error('Create order error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

// Get order by tracking token
router.get('/track/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    const order = await Order.findOne({
      where: { trackingToken: token },
      include: [
        {
          model: OrderItem,
          as: 'Items',
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer's order history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const orders = await Order.findAll({
      where: { customerEmail: email },
      include: [
        {
          model: OrderItem,
          as: 'Items',
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

