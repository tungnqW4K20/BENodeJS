'use strict';

const db = require('../models');
const ViewHistory = db.ViewHistory;
const Product = db.Product;
const { Op } = db.Sequelize;

/**
 * Ghi hoặc cập nhật lịch sử xem
 */
const recordView = async (customerId, productId) => {
  // Kiểm tra xem bản ghi có tồn tại chưa
  const existing = await ViewHistory.findOne({
    where: { customer_id: customerId, product_id: productId }
  });

  if (existing) {
    await existing.update({ viewed_at: new Date() });
    return existing;
  }

  // Nếu chưa có → tạo mới
  return await ViewHistory.create({
    customer_id: customerId,
    product_id: productId,
    viewed_at: new Date()
  });
};

/**
 * Lấy danh sách lịch sử xem gần đây của 1 khách hàng
 */
const getRecentViews = async (customerId, { limit = 10, page = 1 }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);

  return await ViewHistory.findAndCountAll({
    where: { customer_id: customerId },
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'image_url']
      }
    ],
    order: [['viewed_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
};

/**
 * Xóa 1 bản ghi lịch sử xem (có kiểm tra quyền)
 */
const deleteViewHistory = async (id, customerId) => {
  const history = await ViewHistory.findOne({
    where: { id, customer_id: customerId }
  });

  if (!history) {
    throw new Error(`Không tìm thấy bản ghi lịch sử xem với ID ${id}.`);
  }

  await history.destroy();
};

module.exports = {
  recordView,
  getRecentViews,
  deleteViewHistory
};
