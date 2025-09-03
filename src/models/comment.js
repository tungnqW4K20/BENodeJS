'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      Comment.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });

      // Self-referencing for replies
      Comment.belongsTo(models.Comment, { as: 'ParentComment', foreignKey: 'parent_id' });
      Comment.hasMany(models.Comment, { as: 'Replies', foreignKey: 'parent_id' });
    }
  }
  Comment.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING(500), // Or TEXT
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow comment not tied to a product? Or set false?
      references: {
        model: 'products', // Ensure matches Product model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If product deleted, delete associated comments
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow anonymous comments? Or set false?
      references: {
        model: 'customers', // Ensure matches Customer model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If customer deleted, delete their comments
    },
    parent_id: { // For threaded comments/replies
      type: DataTypes.INTEGER,
      allowNull: true, // Top-level comments have null parent_id
      references: {
        model: 'comments', // Self-reference to the same table
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If parent comment deleted, delete replies
    }
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: true // Add createdAt/updatedAt
  });
  return Comment;
};