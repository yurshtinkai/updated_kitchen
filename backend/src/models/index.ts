import sequelize from '../config/database';
import Admin from './Admin';
import Product from './Product';
import Order from './Order';
import OrderItem from './OrderItem';
import Inventory from './Inventory';

// Define associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'Items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export {
  sequelize,
  Admin,
  Product,
  Order,
  OrderItem,
  Inventory,
};

