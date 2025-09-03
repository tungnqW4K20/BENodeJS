'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     * As requested, this model has no associations.
     */
    static associate(models) {
      // Admin model does not have any associations with other models
    }
  }
  Admin.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    username: { // Thường dùng cho đăng nhập
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: { // Mật khẩu (nên được hash trước khi lưu)
      type: DataTypes.STRING(255), // Độ dài đủ cho mật khẩu đã hash
      allowNull: false
    },
    email: { // Tương tự Supplier, hữu ích cho admin
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: { // Tên hiển thị, có thể giống Supplier
      type: DataTypes.STRING(100),
      allowNull: true // Có thể để trống nếu username đã đủ
    },
    phonenumber: { // Số điện thoại, tương tự Supplier
      type: DataTypes.STRING(20), // Giới hạn độ dài cho SĐT
      allowNull: true // Có thể để trống cho admin
    }
    // Bạn có thể thêm các trường khác nếu cần, ví dụ: role, lastLogin, etc.
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins', // Tên bảng trong database (thường là số nhiều, chữ thường)
    timestamps: true // Tự động thêm createdAt và updatedAt
  });
  return Admin;
};