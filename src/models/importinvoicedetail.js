'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ImportInvoiceDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ImportInvoiceDetail.belongsTo(models.ImportInvoice, { foreignKey: 'import_invoices_id' }); // Match FK
      ImportInvoiceDetail.belongsTo(models.Product, { foreignKey: 'products_id' }); // Match FK
      ImportInvoiceDetail.belongsTo(models.ColorProduct, { foreignKey: 'color_product_id' });
      ImportInvoiceDetail.belongsTo(models.SizeProduct, { foreignKey: 'size_product_id' });
    }
  }
  ImportInvoiceDetail.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    import_invoices_id: { // Keep SQL name
      type: DataTypes.INTEGER,
      allowNull: true, // Should likely be false
      references: {
        model: 'import_invoices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // If invoice deleted, delete details
    },
    products_id: { // Keep SQL name
      type: DataTypes.INTEGER,
      allowNull: true, // Should likely be false
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT' // Don't delete product if in import history? Or SET NULL?
    },
    color_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'color_products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Don't delete color variant if in import history?
    },
    size_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'size_products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Don't delete size variant if in import history?
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0 // Can import 0 quantity? Or should be min: 1?
      }
    },
    price: { // Purchase price
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Should likely be false
    }
  }, {
    sequelize,
    modelName: 'ImportInvoiceDetail',
    tableName: 'import_invoices_details',
    timestamps: true // Add createdAt/updatedAt
  });
  return ImportInvoiceDetail;
};