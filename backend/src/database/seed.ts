import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import Admin from '../models/Admin';
import Product from '../models/Product';
import Inventory from '../models/Inventory';

async function seed() {
  try {
    // Create default admin
    const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        email: 'admin@chox.com',
        password: hashedPassword,
      });
      console.log('Default admin created: username=admin, password=admin123');
    }

    // Seed products
    const products = [
      { name: 'Caesar Salad', price: 8.99, category: 'appetizers', description: 'Fresh romaine lettuce with parmesan cheese and croutons', image: '/1.jpg', popular: true },
      { name: 'Buffalo Wings', price: 12.99, category: 'appetizers', description: 'Spicy chicken wings with blue cheese dip', image: '/2.jpg', popular: false },
      { name: 'Mozzarella Sticks', price: 9.99, category: 'appetizers', description: 'Crispy breaded mozzarella with marinara sauce', image: '/3.jpg', popular: true },
      { name: 'Bruschetta', price: 7.99, category: 'appetizers', description: 'Toasted bread with fresh tomatoes and basil', image: '/4.jpg', popular: false },
      { name: 'Grilled Salmon', price: 18.99, category: 'mains', description: 'Fresh Atlantic salmon with lemon herb butter', image: '/5.jpg', popular: true },
      { name: 'Beef Burger', price: 14.99, category: 'mains', description: 'Juicy beef patty with lettuce, tomato, and special sauce', image: '/6.jpg', popular: true },
      { name: 'Chicken Parmesan', price: 16.99, category: 'mains', description: 'Breaded chicken breast with marinara and mozzarella', image: '/7.jpg', popular: false },
      { name: 'Vegetarian Pasta', price: 13.99, category: 'mains', description: 'Penne pasta with seasonal vegetables and olive oil', image: '/8.jpg', popular: false },
      { name: 'Ribeye Steak', price: 24.99, category: 'mains', description: 'Premium ribeye steak cooked to perfection', image: '/1.jpg', popular: true },
      { name: 'Fish & Chips', price: 15.99, category: 'mains', description: 'Beer-battered fish with crispy fries', image: '/2.jpg', popular: false },
      { name: 'Chocolate Cake', price: 6.99, category: 'desserts', description: 'Rich chocolate cake with vanilla ice cream', image: '/3.jpg', popular: true },
      { name: 'Tiramisu', price: 7.99, category: 'desserts', description: 'Classic Italian dessert with coffee and mascarpone', image: '/4.jpg', popular: true },
      { name: 'Chicken Katsu W/ Cucumber', price: 150, category: 'desserts', description: 'Three scoops with your choice of toppings', image: '/5.jpg', popular: false },
      { name: 'Cheesecake', price: 6.99, category: 'desserts', description: 'New York style cheesecake with berry compote', image: '/6.jpg', popular: false },
      { name: 'Fresh Orange Juice', price: 4.99, category: 'beverages', description: 'Freshly squeezed orange juice', image: '/7.jpg', popular: false },
      { name: 'Premium Coffee', price: 3.99, category: 'beverages', description: 'Premium roasted coffee beans', image: '/8.jpg', popular: true },
      { name: 'Soft Drinks', price: 2.99, category: 'beverages', description: 'Coke, Pepsi, Sprite, or Fanta', image: '/1.jpg', popular: false },
      { name: 'Craft Beer', price: 5.99, category: 'beverages', description: 'Local craft beer selection', image: '/2.jpg', popular: true },
      { name: 'Wine Selection', price: 8.99, category: 'beverages', description: 'Curated wine selection by the glass', image: '/3.jpg', popular: false },
    ];

    for (const product of products) {
      await Product.findOrCreate({
        where: { name: product.name },
        defaults: product,
      });
    }
    console.log('Products seeded successfully');

    // Seed inventory - Matching menu categories
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

    for (const item of inventoryItems) {
      await Inventory.findOrCreate({
        where: { name: item.name },
        defaults: item,
      });
    }
    console.log('Inventory seeded successfully');

    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

