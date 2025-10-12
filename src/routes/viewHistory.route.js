'use strict';

const express = require('express');
const viewHistoryController = require('../controllers/viewHistory.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Ghi lại hoặc cập nhật lịch sử xem
router.post('/', authenticateToken, viewHistoryController.recordView);

// Lấy danh sách lịch sử xem gần đây của 1 khách hàng
router.get('/', authenticateToken, viewHistoryController.getRecentViews);

// Xóa lịch sử xem (tùy chọn)
router.delete('/:id', authenticateToken, viewHistoryController.deleteViewHistory);

module.exports = router;
