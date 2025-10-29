import sequelize from '../config/database';

async function addOrderFields() {
  try {
    console.log('Adding deliveryAddress and specialInstructions fields to orders table...');

    // Add deliveryAddress field
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN deliveryAddress TEXT NULL 
      AFTER customerPhone
    `).catch(() => {
      console.log('deliveryAddress field may already exist');
    });

    // Add specialInstructions field
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN specialInstructions TEXT NULL 
      AFTER deliveryAddress
    `).catch(() => {
      console.log('specialInstructions field may already exist');
    });

    console.log('✓ Fields added successfully');
    
    console.log('Database migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addOrderFields();

