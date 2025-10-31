import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import OrderItem from './OrderItem';

class Order extends Model {
  public id!: number;
  public customerName!: string;
  public customerEmail?: string;
  public customerPhone?: string;
  public deliveryAddress?: string;
  public specialInstructions?: string;
  public totalAmount!: number;
  public status!: string;
  public orderDate!: Date;
  public receiptImage?: string;
  public trackingToken?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public Items?: OrderItem[];
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'on_the_way', 'delivered', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    orderDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    receiptImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    trackingToken: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  }
);

export default Order;

