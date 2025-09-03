'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.CartItem, { foreignKey: 'customer_id', as: 'cartItems' });
      Customer.hasMany(models.Order, { foreignKey: 'customer_id', as: 'orders' });
      Customer.hasMany(models.Comment, { foreignKey: 'customer_id', as: 'comments' });
      Customer.hasMany(models.Rating, { foreignKey: 'customer_id', as: 'ratings' });
    }
  }

  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,          // Cho phép null
      unique: true,             // Nhưng nếu có thì phải duy nhất
      defaultValue: null,
    },
    address: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      defaultValue: null,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    paranoid: true,
  });

  return Customer;
};
