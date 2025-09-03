'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ImportInvoice extends Model {
    static associate(models) {
      ImportInvoice.belongsTo(models.Supplier, { foreignKey: 'supliers_id', as: 'supplier' }); // Use original FK name
      ImportInvoice.hasMany(models.ImportInvoiceDetail, { foreignKey: 'import_invoices_id', as: 'details' }); // Use original FK name
    }
  }
  ImportInvoice.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    import_status: { // Corrected spelling from SQL
      type: DataTypes.ENUM('0', '1', '2'),
      allowNull: false,
      defaultValue: '0',
      comment: '0: Draft/Planned, 1: Submitted/Received, 2: Completed/Closed'
    },
    import_date: { // Corrected spelling from SQL
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    supliers_id: { // Keep original FK name
      type: DataTypes.INTEGER,
      allowNull: false, // An invoice should have a supplier
      references: {
        model: 'supliers', // Ensure matches Supplier model's tableName
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT' // Prevent deleting supplier if they have invoices
    }
    // You might add fields like totalCost, notes, etc.
  }, {
    sequelize,
    modelName: 'ImportInvoice',
    tableName: 'import_invoices',
    timestamps: true // Add createdAt/updatedAt
  });
  return ImportInvoice;
};