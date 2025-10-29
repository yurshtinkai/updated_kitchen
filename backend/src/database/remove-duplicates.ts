import sequelize from '../config/database';
import Inventory from '../models/Inventory';

async function removeDuplicates() {
  try {
    console.log('Searching for duplicate inventory items...');
    
    // Get all inventory items
    const items = await Inventory.findAll({
      order: [['id', 'ASC']]
    });
    
    const seen = new Set<string>();
    const duplicates: number[] = [];
    
    // Find duplicates
    for (const item of items) {
      if (seen.has(item.name)) {
        duplicates.push(item.id);
        console.log(`Found duplicate: ${item.name} (id: ${item.id})`);
      } else {
        seen.add(item.name);
      }
    }
    
    if (duplicates.length > 0) {
      // Delete duplicates (keep the first occurrence)
      const deletedCount = await Inventory.destroy({
        where: { id: duplicates }
      });
      
      console.log(`✓ Deleted ${deletedCount} duplicate inventory items`);
    } else {
      console.log('✓ No duplicates found');
    }
    
    console.log('✓ Duplicate removal completed successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Duplicate removal failed:', error);
    process.exit(1);
  }
}

removeDuplicates();

