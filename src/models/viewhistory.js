'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ViewHistory extends Model {
    static associate(models) {
      // Mỗi bản ghi thuộc về một khách hàng
      ViewHistory.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
        onDelete: 'CASCADE'
      });

      // Mỗi bản ghi thuộc về một sản phẩm
      ViewHistory.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
      });
    }
  }

  ViewHistory.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ViewHistory',
    tableName: 'view_histories',
    timestamps: true,
    paranoid: true
  });

  return ViewHistory;
};
