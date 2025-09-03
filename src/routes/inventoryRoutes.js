
'use strict';
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); // Thêm middleware nếu cần

// Lấy chi tiết tồn kho cho một sản phẩm
router.get('/product/:productId', inventoryController.getByProductId);

// Cập nhật hàng loạt tồn kho
router.put('/batch-update', authenticateToken, authorizeRole("admin"), inventoryController.batchUpdate);


module.exports = router;

