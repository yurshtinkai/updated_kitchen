import sequelize from '../config/database';

async function addReceiptTrackingFields() {
  try {
    console.log('Adding receipt and tracking fields to orders table...');

    // Update status enum to include new statuses
    await sequelize.query(`
      ALTER TABLE orders 
      MODIFY status ENUM('pending','preparing','on_the_way','delivered','completed','cancelled','processing') 
      NOT NULL DEFAULT 'pending'
    `).catch((err: any) => {
      console.log('Status enum update error (may already be updated):', err.message);
    });

    // Add receiptImage field
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN receiptImage VARCHAR(500) NULL 
      AFTER orderDate
    `).catch((err: any) => {
      if (err.message.includes('Duplicate column')) {
        console.log('receiptImage field already exists');
      } else {
        console.error('Error adding receiptImage:', err.message);
      }
    });

    // Add trackingToken field
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN trackingToken VARCHAR(100) NULL UNIQUE 
      AFTER receiptImage
    `).catch((err: any) => {
      if (err.message.includes('Duplicate column')) {
        console.log('trackingToken field already exists');
      } else {
        console.error('Error adding trackingToken:', err.message);
      }
    });

    console.log('✓ Migration completed successfully');
    
    process.exit(0);
  } catch (error: any) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

addReceiptTrackingFields();

