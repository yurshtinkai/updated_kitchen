import { Router, Response } from 'express';
import { Op } from 'sequelize';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Product from '../models/Product';
import Inventory from '../models/Inventory';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Sales Reports
router.get('/sales', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = 'all', page = '1', limit = '30' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Date range based on period
    let whereClause: any = {};
    const now = new Date();

    if (period === 'weekly') {
      whereClause = {
        createdAt: {
          [Op.gte]: new Date(now.setDate(now.getDate() - 7)),
        },
      };
    } else if (period === 'monthly') {
      whereClause = {
        createdAt: {
          [Op.gte]: new Date(now.setMonth(now.getMonth() - 1)),
        },
      };
    } else if (period === 'yearly') {
      whereClause = {
        createdAt: {
          [Op.gte]: new Date(now.setFullYear(now.getFullYear() - 1)),
        },
      };
    }

    // Get sales data - only completed orders count as sales
    const { count, rows: sales } = await Order.findAndCountAll({
      where: {
        ...whereClause,
        status: 'completed'
      },
      include: [
        {
          model: OrderItem,
          as: 'Items',
          attributes: ['productId', 'quantity', 'subtotal'],
        },
      ],
      // IMPORTANT: when including associations, Sequelize can duplicate rows.
      // distinct ensures count and limit apply to unique Orders.
      distinct: true,
      subQuery: false,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
    });

    // Calculate total sales - only completed orders count as sales
    const totalSales = await Order.sum('totalAmount', { 
      where: {
        ...whereClause,
        status: 'completed'
      } 
    });

    // Get product sales statistics for pie chart
    const productSales = await OrderItem.findAll({
      attributes: [
        'productId',
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.quantity')), 'totalQuantity'],
        [require('sequelize').fn('SUM', require('sequelize').col('OrderItem.subtotal')), 'totalRevenue'],
      ],
      include: [
        {
          model: Order,
          as: 'Order',
          attributes: [],
          where: {
            ...whereClause,
            status: 'completed'
          },
        },
      ],
      group: ['productId'],
      raw: true,
    });

    // Get product names
    const productIds = productSales.map((ps: any) => ps.productId);
    const products = await Product.findAll({
      where: { id: productIds },
    });

    const productSalesWithNames = productSales.map((ps: any) => {
      const product = products.find((p) => p.id === ps.productId);
      return {
        productId: ps.productId,
        productName: product?.name || 'Unknown',
        totalQuantity: ps.totalQuantity,
        totalRevenue: parseFloat(ps.totalRevenue || 0),
      };
    });

    // Get daily sales data for line chart - only completed orders
    const dailySales = await Order.findAll({
      attributes: [
        [require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'date'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalAmount')), 'total'],
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      where: {
        ...whereClause,
        status: 'completed'
      },
      group: [require('sequelize').fn('DATE', require('sequelize').col('createdAt'))],
      order: [[require('sequelize').fn('DATE', require('sequelize').col('createdAt')), 'ASC']],
      raw: true,
    });

    res.json({
      totalSales: parseFloat((totalSales || 0).toString()),
      totalOrders: count,
      sales,
      productSales: productSalesWithNames,
      dailySales: dailySales.map((ds: any) => ({
        date: ds.date,
        total: parseFloat(ds.total || 0),
        count: parseInt(ds.count || 0),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Orders Reports
router.get('/orders', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '30',
      orderId,
      customerName,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause: any = {};

    if (orderId) {
      whereClause.id = orderId;
    }

    if (customerName) {
      whereClause.customerName = {
        [Op.like]: `%${customerName}%`,
      };
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'Items',
          include: [{ model: Product, attributes: ['name'] }],
        },
      ],
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Orders report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inventory Reports
router.get('/inventory', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = '1', limit = '30' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows } = await Inventory.findAndCountAll({
      limit: limitNum,
      offset,
      order: [
        [
          require('sequelize').literal(`CASE WHEN quantity < minStockLevel THEN 0 ELSE 1 END`),
          'ASC',
        ],
        ['quantity', 'ASC'],
      ],
    });

    res.json({
      inventory: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

