import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import Inventory from '../models/Inventory';
import { body, validationResult } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all inventory items
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await Inventory.findAll({
      order: [
        [
          require('sequelize').literal(`CASE WHEN quantity < minStockLevel THEN 0 ELSE 1 END`),
          'ASC',
        ],
        ['quantity', 'ASC'],
      ],
    });

    res.json(items);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single inventory item
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create inventory item
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
    body('minStockLevel').isFloat({ min: 0 }).withMessage('Min stock level must be a positive number'),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const item = await Inventory.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error('Create inventory item error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update inventory item
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.update(req.body);
    await item.reload();

    res.json(item);
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add quantity to inventory item
router.put('/:id/add-quantity', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    item.quantity = parseFloat(item.quantity.toString()) + parseFloat(quantity.toString());
    await item.save();
    await item.reload();

    res.json(item);
  } catch (error) {
    console.error('Add quantity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete inventory item
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await Inventory.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await item.destroy();

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

