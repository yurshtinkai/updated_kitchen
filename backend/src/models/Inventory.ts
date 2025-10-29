import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Inventory extends Model {
  public id!: number;
  public name!: string;
  public category!: string;
  public quantity!: number;
  public unit!: string;
  public minStockLevel!: number;
  public supplier?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Inventory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pcs',
    },
    minStockLevel: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    supplier: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventory',
    timestamps: true,
  }
);

export default Inventory;

