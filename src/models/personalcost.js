'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PersonalCost extends Model {
    static associate(models) {
      PersonalCost.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    }
  }
  PersonalCost.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders', // Ensure matches Order model's tableName
        key: 'id'
      },
      onDelete: 'CASCADE', // As defined in SQL
      onUpdate: 'CASCADE'  // As defined in SQL
    },
    name: {
      type: DataTypes.STRING(250), // nvarchar -> STRING
      allowNull: true // e.g., 'Shipping Fee', 'Gift Wrap'
    },
    description: {
      type: DataTypes.STRING(255), // Or TEXT
      allowNull: false // More details if needed
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0 // Replicates CHECK constraint
      }
    }
    // Sequelize will automatically manage createdAt and updatedAt
    // The 'created_at' column from SQL will be mapped to 'createdAt' by default
  }, {
    sequelize,
    modelName: 'PersonalCost',
    tableName: 'personal_costs',
    timestamps: true, // Enable default createdAt and updatedAt
    // If you absolutely need the column named 'created_at' and no 'updatedAt':
    // timestamps: true,
    // updatedAt: false,
    // createdAt: 'created_at'
  });
  return PersonalCost;
};