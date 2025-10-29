# Inventory Management Commands

## Available Commands

### Reset Inventory (Recommended)
Completely resets inventory with no duplicates:
```bash
npm run reset-inventory
```
- Deletes ALL inventory items
- Adds 18 unique items with proper categories
- No duplicates guaranteed

### Remove Duplicates Only
Removes only duplicate items (keeps first occurrence):
```bash
npm run remove-duplicates
```

### Clean All Inventory
Deletes all inventory items (doesn't add new ones):
```bash
npm run clean-inventory
```

### Seed Inventory
Adds inventory items (doesn't delete existing):
```bash
npm run seed
```

## Inventory Categories

✅ **Appetizers** (4 items)
- Romaine Lettuce
- Buffalo Sauce
- Mozzarella Cheese
- Bread Crumbs

✅ **Main Courses** (5 items)
- Salmon Fillet
- Ground Beef
- Chicken Breast
- Pasta
- Ribeye Steak

✅ **Desserts** (4 items)
- Chocolate
- Flour
- Vanilla Extract
- Heavy Cream

✅ **Beverages** (5 items)
- Coffee Beans
- Orange Juice
- Soft Drinks
- Beer
- Wine

## Quick Fix for Duplicates

If you see duplicates in your database:

```bash
cd backend
npm run reset-inventory
```

This will:
1. Delete all existing inventory items
2. Add 18 fresh items (no duplicates)
3. Categorize them properly

