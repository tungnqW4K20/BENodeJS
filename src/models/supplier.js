'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model { // Changed from supliers
    static associate(models) {
      Supplier.hasMany(models.ImportInvoice, { foreignKey: 'supliers_id', as: 'importInvoices' }); // Use original FK name
    }
  }
  Supplier.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phonenumber: { // Kept original name
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Supplier',
    tableName: 'supliers', // Use original table name
    timestamps: true,
    paranoid: true
  });
  return Supplier;
};