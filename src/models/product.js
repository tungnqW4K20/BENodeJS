'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
      Product.hasMany(models.ColorProduct, { foreignKey: 'product_id', as: 'colorOptions' });
      Product.hasMany(models.SizeProduct, { foreignKey: 'product_id', as: 'sizeOptions' });
      Product.hasMany(models.CartItem, { foreignKey: 'product_id', as: 'cartItems' });
      Product.hasMany(models.OrderDetail, { foreignKey: 'products_id', as: 'orderDetails' }); // Use original FK name
      Product.hasMany(models.ImportInvoiceDetail, { foreignKey: 'products_id', as: 'importDetails' }); // Use original FK name
      Product.hasMany(models.Comment, { foreignKey: 'product_id', as: 'comments' });
      Product.hasMany(models.Rating, { foreignKey: 'products_id', as: 'ratings' }); // Use original FK name
    }
  }
  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(500), // Or DataTypes.TEXT for longer descriptions
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Base price can be null if variations define price
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Or false if category is mandatory
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Or 'RESTRICT' / 'CASCADE'
    },
     image_url: {
      type: DataTypes.STRING(500), // Increased length for potentially long URLs
      allowNull: true
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    paranoid: true
  });
  return Product;
};