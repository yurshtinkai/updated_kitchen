import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import Product from '../models/Product';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all products
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await Product.findAll({
      order: [['name', 'ASC']],
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
