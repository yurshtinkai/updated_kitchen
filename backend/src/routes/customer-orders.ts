import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import { body, validationResult } from 'express-validator';

const router = Router();

// Create customer order
router.post(
  '/',
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { customerName, customerEmail, customerPhone, deliveryAddress, totalAmount, items, specialInstructions } = req.body;

      // Create order
      const order = await Order.create({
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        specialInstructions,
        totalAmount,
        status: 'pending',
      });

      // Create order items
      for (const item of items) {
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

      res.status(201).json({
        message: 'Order placed successfully',
        order: completeOrder,
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

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

