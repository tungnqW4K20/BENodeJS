'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ColorProduct extends Model {
    static associate(models) {
      ColorProduct.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      // Association to the join table (Inventory)
      ColorProduct.belongsToMany(models.SizeProduct, {
        through: models.Inventory, // The join table model
        foreignKey: 'color_product_id', // FK in Inventory pointing to ColorProduct
        otherKey: 'size_product_id', // FK in Inventory pointing to SizeProduct
        as: 'availableSizes'
      });
       ColorProduct.hasMany(models.Inventory, { foreignKey: 'color_product_id', as: 'inventoryEntries' }); // Direct link to inventory
      ColorProduct.hasMany(models.CartItem, { foreignKey: 'color_product_id', as: 'cartItems' });
      ColorProduct.hasMany(models.OrderDetail, { foreignKey: 'color_product_id', as: 'orderDetails' });
      ColorProduct.hasMany(models.ImportInvoiceDetail, { foreignKey: 'color_product_id', as: 'importDetails' });
    }
  }
  ColorProduct.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false // e.g., 'Red', 'Blue', 'Green'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Optional price adjustment for this specific color
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // A color variant should belong to a product
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If product is deleted, delete its color variants
    },
    image_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of up to 7 image URLs for this color variant.',
      validate: {
        isValidImageArray(value) {
          if (value === null) {
            return;
          }
          if (!Array.isArray(value)) {
            throw new Error('image_urls must be an array.');
          }
          if (value.length > 7) {
            throw new Error('A maximum of 7 image URLs are allowed.');
          }
          for (const item of value) {
            if (typeof item !== 'string' && item !== null) {
              throw new Error('Each item in image_urls must be a string URL or null.');
            }
          }
        }
      },
    },
    colorCode: {
      field: 'color_code', // Tên cột trong CSDL
      type: DataTypes.STRING(50),
      allowNull: true, // Cho phép null nếu mã màu không phải lúc nào cũng có
      comment: "The hex or rgb code for the color, e.g., '#FFFFFF' or 'rgb(255,0,0)'."
    },
  },
   
  {
    sequelize,
    modelName: 'ColorProduct',
    tableName: 'color_products',
    timestamps: true,
    paranoid: true  
  });
  return ColorProduct;
};