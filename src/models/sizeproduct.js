'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SizeProduct extends Model {
    static associate(models) {
      SizeProduct.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      // Association to the join table (Inventory)
      SizeProduct.belongsToMany(models.ColorProduct, {
        through: models.Inventory, // The join table model
        foreignKey: 'size_product_id', // FK in Inventory pointing to SizeProduct
        otherKey: 'color_product_id', // FK in Inventory pointing to ColorProduct
        as: 'availableColors'
      });
      SizeProduct.hasMany(models.Inventory, { foreignKey: 'size_product_id', as: 'inventoryEntries' }); // Direct link to inventory
      SizeProduct.hasMany(models.CartItem, { foreignKey: 'size_product_id', as: 'cartItems' });
      SizeProduct.hasMany(models.OrderDetail, { foreignKey: 'size_product_id', as: 'orderDetails' });
      SizeProduct.hasMany(models.ImportInvoiceDetail, { foreignKey: 'size_product_id', as: 'importDetails' });
    }
  }
  SizeProduct.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false // e.g., 'S', 'M', 'L', 'XL'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Optional price adjustment for this specific size
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // A size variant should belong to a product
      references: {
        model: 'products',
        key: 'id'
      },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE' // If product is deleted, delete its size variants
    }
  }, {
    sequelize,
    modelName: 'SizeProduct',
    tableName: 'size_products',
    timestamps: true,
    paranoid: true
  });
  return SizeProduct;
};