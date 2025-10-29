import sequelize from '../config/database';
import Inventory from '../models/Inventory';

async function resetInventory() {
  try {
    console.log('🔄 Resetting inventory...');
    
    // Delete ALL inventory items
    const deletedCount = await Inventory.destroy({ where: {} });
    console.log(`✓ Deleted ${deletedCount} inventory items`);
    
    // Seed fresh inventory with proper categories
    const inventoryItems = [
      // Appetizers Supplies
      { name: 'Romaine Lettuce', category: 'Appetizers', quantity: 50, unit: 'lbs', minStockLevel: 20, supplier: 'Fresh Farms' },
      { name: 'Buffalo Sauce', category: 'Appetizers', quantity: 15, unit: 'bottles', minStockLevel: 5, supplier: 'Spice Co' },
      { name: 'Mozzarella Cheese', category: 'Appetizers', quantity: 25, unit: 'lbs', minStockLevel: 10, supplier: 'Dairy Co' },
      { name: 'Bread Crumbs', category: 'Appetizers', quantity: 30, unit: 'lbs', minStockLevel: 10, supplier: 'Bakery Supply' },
      
      // Main Courses Supplies
      { name: 'Salmon Fillet', category: 'Main Courses', quantity: 15, unit: 'lbs', minStockLevel: 10, supplier: 'Ocean Fresh' },
      { name: 'Ground Beef', category: 'Main Courses', quantity: 8, unit: 'lbs', minStockLevel: 20, supplier: 'Premium Meats' },
      { name: 'Chicken Breast', category: 'Main Courses', quantity: 35, unit: 'lbs', minStockLevel: 15, supplier: 'Premium Meats' },
      { name: 'Pasta', category: 'Main Courses', quantity: 80, unit: 'lbs', minStockLevel: 20, supplier: 'Bakery Supply' },
      { name: 'Ribeye Steak', category: 'Main Courses', quantity: 25, unit: 'lbs', minStockLevel: 10, supplier: 'Premium Meats' },
      
      // Desserts Supplies
      { name: 'Chocolate', category: 'Desserts', quantity: 20, unit: 'lbs', minStockLevel: 8, supplier: 'Sweet Supplies' },
      { name: 'Flour', category: 'Desserts', quantity: 100, unit: 'lbs', minStockLevel: 30, supplier: 'Bakery Supply' },
      { name: 'Vanilla Extract', category: 'Desserts', quantity: 12, unit: 'bottles', minStockLevel: 5, supplier: 'Quality Imports' },
      { name: 'Heavy Cream', category: 'Desserts', quantity: 30, unit: 'quarts', minStockLevel: 10, supplier: 'Dairy Co' },
      
      // Beverages Supplies
      { name: 'Coffee Beans', category: 'Beverages', quantity: 50, unit: 'lbs', minStockLevel: 15, supplier: 'Coffee Roasters' },
      { name: 'Orange Juice', category: 'Beverages', quantity: 40, unit: 'gallons', minStockLevel: 10, supplier: 'Fresh Juices' },
      { name: 'Soft Drinks', category: 'Beverages', quantity: 120, unit: 'cans', minStockLevel: 50, supplier: 'Beverage Co' },
      { name: 'Beer', category: 'Beverages', quantity: 80, unit: 'bottles', minStockLevel: 30, supplier: 'Craft Brewery' },
      { name: 'Wine', category: 'Beverages', quantity: 45, unit: 'bottles', minStockLevel: 15, supplier: 'Wine Imports' },
    ];

    console.log('📦 Adding fresh inventory items...');
    for (const item of inventoryItems) {
      await Inventory.create(item);
    }
    
    console.log('✅ Successfully added 18 unique inventory items');
    console.log('   - 4 Appetizers items');
    console.log('   - 5 Main Courses items');
    console.log('   - 4 Desserts items');
    console.log('   - 5 Beverages items');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  }
}

resetInventory();

