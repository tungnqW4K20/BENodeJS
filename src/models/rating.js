'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.Product, { foreignKey: 'products_id', as: 'product' }); // Use original FK name
      Rating.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    }
  }
  Rating.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    quantity_stars: { // Keep SQL name
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Assuming 1-5 star rating
        max: 5
      }
    },
    products_id: { // Keep SQL name
      type: DataTypes.INTEGER,
      allowNull: false, // Rating must be for a product
      references: {
        model: 'products', // Ensure matches Product model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If product deleted, delete its ratings
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Rating must be by a logged-in user
      references: {
        model: 'customers', // Ensure matches Customer model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If customer deleted, delete their ratings
    }
  }, {
    sequelize,
    modelName: 'Rating',
    tableName: 'rating', // Use original table name
    timestamps: true, // Add createdAt/updatedAt
    indexes: [
        {
            // Prevent a customer from rating the same product multiple times
            unique: true,
            fields: ['products_id', 'customer_id'],
            name: 'unique_product_customer_rating'
        }
    ]
  });
  return Rating;
};