'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    static associate(models) {
      OrderDetail.belongsTo(models.Order, { foreignKey: 'orders_id', as: 'order' }); // Use original FK name
      OrderDetail.belongsTo(models.Product, { foreignKey: 'products_id', as: 'product' }); // Use original FK name
      OrderDetail.belongsTo(models.ColorProduct, { foreignKey: 'color_product_id', as: 'colorVariant' });
      OrderDetail.belongsTo(models.SizeProduct, { foreignKey: 'size_product_id', as: 'sizeVariant' });
    }
  }
  OrderDetail.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    orders_id: { // Keep SQL name
      type: DataTypes.INTEGER,
      allowNull: false, // Detail must belong to an order
      references: {
        model: 'orders', // Ensure matches Order model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If order deleted, delete its details
    },
    products_id: { // Keep SQL name - references the base product
      type: DataTypes.INTEGER,
      allowNull: false, // Detail must reference a product
      references: {
        model: 'products', // Ensure matches Product model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      // Decide deletion behavior: RESTRICT prevents deleting product if in orders, SET NULL keeps order history but unlinks product
      onDelete: 'RESTRICT'
    },
     color_product_id: { // References the specific color variant ordered
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'color_products', // Ensure matches ColorProduct model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      // Decide deletion behavior: RESTRICT prevents deleting variant if in orders, SET NULL might be okay if variant details aren't critical later
      onDelete: 'RESTRICT'
    },
    size_product_id: { // References the specific size variant ordered
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'size_products', // Ensure matches SizeProduct model's tableName
        key: 'id'
      },
       onUpdate: 'CASCADE',
       // Decide deletion behavior similar to color_product_id
       onDelete: 'RESTRICT'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
       validate: {
        min: 1 // Must order at least one
      }
    },
    price: { // Price of the item AT THE TIME of the order
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false // Price should be recorded when order is placed
    },
     image_url: {
      type: DataTypes.STRING(500), // Increased length for potentially long URLs
      allowNull: true
    }, 
  },
  {
    sequelize,
    modelName: 'OrderDetail',
    tableName: 'ordersdetail', // Use original table name
    timestamps: true,
    paranoid: true // Add createdAt/updatedAt
  });
  return OrderDetail;
};