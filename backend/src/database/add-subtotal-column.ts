import sequelize from '../config/database';

async function addSubtotalColumn() {
  try {
    console.log('Checking if subtotal column exists...');

    // Check if column exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'order_items' 
      AND COLUMN_NAME = 'subtotal'
      AND TABLE_SCHEMA = DATABASE()
    `);

    if (!Array.isArray(results) || results.length === 0) {
      console.log('Adding subtotal column to order_items table...');
      
      await sequelize.query(`
        ALTER TABLE order_items 
        ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
        AFTER price
      `);

      // Update existing records to have subtotal = price * quantity
      await sequelize.query(`
        UPDATE order_items 
        SET subtotal = price * quantity
      `);

      console.log('✓ Subtotal column added successfully');
    } else {
      console.log('✓ Subtotal column already exists');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addSubtotalColumn();

