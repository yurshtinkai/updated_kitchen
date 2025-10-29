import sequelize from '../config/database';
import Inventory from '../models/Inventory';

async function cleanInventory() {
  try {
    console.log('Cleaning old inventory categories...');
    
    // Delete all inventory items
    const deletedCount = await Inventory.destroy({ where: {} });
    
    console.log(`✓ Deleted ${deletedCount} old inventory items`);
    console.log('✓ Inventory cleanup completed successfully.');
    console.log('💡 Run "npm run seed" to add new inventory items with proper categories');
    
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanInventory();

