'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
      Order.hasMany(models.OrderDetail, { foreignKey: 'orders_id', as: 'orderDetails' }); // Use original FK name
      Order.hasMany(models.PersonalCost, { foreignKey: 'order_id', as: 'personalCosts' });
    }
  }
  Order.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    orderstatus: {
      type: DataTypes.ENUM('0', '1', '2'), // Maps to SQL ENUM
      allowNull: false,
      defaultValue: '0', // Default to pending status
      comment: '0: Pending, 1: Processing/Confirmed, 2: Shipped/Completed/Cancelled'
    },
    orderdate: {
      type: DataTypes.DATE, // datetime -> DATE
      allowNull: false,
      defaultValue: DataTypes.NOW // Set current time on creation
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for guest orders? Or set false?
      references: {
        model: 'customers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Keep order history if customer is deleted
    }
    // You might add fields like totalAmount, shippingAddress, etc. here
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    paranoid: true // Adds createdAt, updatedAt
  });
  return Order;
};