'use strict';

const viewHistoryService = require('../services/viewHistory.service');

// 🟢 Ghi lại hoặc cập nhật lịch sử xem
const recordView = async (req, res) => {
  try {
    const customerId = req.user.id; // Lấy từ token
    const { productId  } = req.body;
    console.log("productId", productId)
    if (!productId  || isNaN(parseInt(productId ))) {
      return res.status(400).json({ success: false, message: 'product_id không hợp lệ.' });
    }

    const result = await viewHistoryService.recordView(customerId, productId );

    res.status(200).json({
      success: true,
      message: 'Cập nhật lịch sử xem thành công!',
      data: result
    });
  } catch (error) {
    console.error("Record ViewHistory Error:", error.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi ghi lịch sử xem.' });
  }
};

// 🟢 Lấy danh sách lịch sử xem của người dùng
const getRecentViews = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { limit = 10, page = 1 } = req.query;

    const result = await viewHistoryService.getRecentViews(customerId, { limit, page });

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        totalItems: result.count,
        totalPages: Math.ceil(result.count / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Get Recent Views Error:", error.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy lịch sử xem.' });
  }
};

// 🟢 Xóa 1 bản ghi lịch sử xem (tùy chọn)
const deleteViewHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    await viewHistoryService.deleteViewHistory(id, customerId);

    res.status(200).json({
      success: true,
      message: 'Xóa lịch sử xem thành công!'
    });
  } catch (error) {
    console.error("Delete ViewHistory Error:", error.message);
    if (error.message.includes('Không tìm thấy')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa lịch sử xem.' });
  }
};

module.exports = {
  recordView,
  getRecentViews,
  deleteViewHistory
};
