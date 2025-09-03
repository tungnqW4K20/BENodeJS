'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  // This model represents the JOIN TABLE between ColorProduct and SizeProduct
  // and holds the quantity for each specific variant combination.
  class Inventory extends Model {
    static associate(models) {
      Inventory.belongsTo(models.ColorProduct, { foreignKey: 'color_product_id', as: 'colorVariant' });
      Inventory.belongsTo(models.SizeProduct, { foreignKey: 'size_product_id', as: 'sizeVariant' });

      // You might implicitly get the Product through Color/Size,
      // but adding an explicit association can sometimes be convenient, though requires careful data management.
      // Inventory.belongsTo(models.Product, { through: models.ColorProduct, foreignKey: 'product_id', as: 'product' }); // Example, might need refinement
    }
  }
  Inventory.init({
    // You might not need an explicit 'id' for a join table if the combination of FKs is the PK.
    // However, your SQL defines an 'id', so we include it.
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    color_product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'color_products', // Ensure this matches the table name defined in ColorProduct model
        key: 'id'
      },
      onDelete: 'CASCADE', // As defined in SQL
      onUpdate: 'CASCADE'  // As defined in SQL
      // No primaryKey: true here if 'id' is the PK
    },
    size_product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'size_products', // Ensure this matches the table name defined in SizeProduct model
        key: 'id'
      },
      onDelete: 'CASCADE', // As defined in SQL
      onUpdate: 'CASCADE'  // As defined in SQL
      // No primaryKey: true here if 'id' is the PK
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0 // Replicates CHECK constraint
      }
    }
  }, {
    sequelize,
    modelName: 'Inventory', // Using a more descriptive name
    tableName: 'number_products', // Matches your SQL table name
    timestamps: true,
    indexes: [ // Replicates UNIQUE KEY constraint
      {
        unique: true,
        fields: ['color_product_id', 'size_product_id'],
        name: 'unique_color_size_variant' // Optional: name the index
      }
    ]
    // If color_product_id and size_product_id together form the primary key:
    // primaryKey: true, // Remove 'id' field above and set this on both FKs
  });
  return Inventory;
};