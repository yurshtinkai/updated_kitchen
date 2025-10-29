import sequelize from '../config/database';
import Admin from '../models/Admin';
import Product from '../models/Product';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Inventory from '../models/Inventory';

async function migrate() {
  try {
    console.log('Creating tables...');
    
    // Create tables in order to handle foreign key dependencies
    await Admin.sync({ alter: true });
    console.log('✓ Admins table created');
    
    await Product.sync({ alter: true });
    console.log('✓ Products table created');
    
    await Inventory.sync({ alter: true });
    console.log('✓ Inventory table created');
    
    await Order.sync({ alter: true });
    console.log('✓ Orders table created');
    
    // OrderItem depends on Orders and Products
    await OrderItem.sync({ alter: true });
    console.log('✓ OrderItems table created');
    
    console.log('Database migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

