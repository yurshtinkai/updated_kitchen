import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import { body, validationResult } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all orders
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'Items',
          include: [{ model: Product }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'Items',
          include: [{ model: Product }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
router.post(
  '/',
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('totalAmount').isFloat().withMessage('Total amount must be a valid number'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customerName, customerEmail, customerPhone, items } = req.body;

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;
        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          subtotal,
        });
      }

      // Create order
      const order = await Order.create({
        customerName,
        customerEmail,
        customerPhone,
        totalAmount,
        status: 'pending',
      });

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          ...item,
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

      res.status(201).json(completeOrder);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update order
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { customerName, customerEmail, customerPhone, status, items } = req.body;

    // Update basic order info
    if (customerName) order.customerName = customerName;
    if (customerEmail) order.customerEmail = customerEmail;
    if (customerPhone) order.customerPhone = customerPhone;
    if (status) order.status = status;

    // If items are provided, update them
    if (items) {
      let totalAmount = 0;

      // Delete existing items
      await OrderItem.destroy({ where: { orderId: order.id } });

      // Create new items
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product) continue;

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          subtotal,
        });
      }

      order.totalAmount = totalAmount;
    }

    await order.save();

    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'Items',
        },
      ],
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete order
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Delete order items first
    await OrderItem.destroy({ where: { orderId: order.id } });

    // Delete order
    await order.destroy();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

