'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  // Renamed model to CartItem for clarity (represents one item in a cart)
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
      CartItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      CartItem.belongsTo(models.ColorProduct, { foreignKey: 'color_product_id', as: 'colorVariant' });
      CartItem.belongsTo(models.SizeProduct, { foreignKey: 'size_product_id', as: 'sizeVariant' });
    }
  }
  CartItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    product_id: { // ID of the base product
      type: DataTypes.INTEGER,
      allowNull: false, // A cart item must reference a product
      references: {
        model: 'products',
        key: 'id'
      },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE' // If product deleted, remove cart item
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1 // Must add at least one item
      }
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Assuming only logged-in users have persistent carts
      references: {
        model: 'customers',
        key: 'id'
      },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE' // If customer deleted, clear their cart
    },
    color_product_id: { // ID of the specific color variant chosen
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'color_products',
        key: 'id'
      },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE' // If specific color variant deleted, remove cart item
    },
    size_product_id: { // ID of the specific size variant chosen
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'size_products',
        key: 'id'
      },
       onUpdate: 'CASCADE',
       onDelete: 'CASCADE' // If specific size variant deleted, remove cart item
    }
     // You might add a unique constraint on (customer_id, product_id, color_product_id, size_product_id)
     // if you want only one cart entry per specific product variant per customer (just update quantity)
  }, {
    sequelize,
    modelName: 'CartItem', // Renamed model
    tableName: 'carts',    // Matches your SQL table name
    timestamps: true
  });
  return CartItem;
};