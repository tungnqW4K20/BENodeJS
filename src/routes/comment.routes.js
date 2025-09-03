'use strict';
const express = require('express');
const commentController = require('../controllers/comment.controller');
// Giả sử bạn có middleware này để xác thực và phân quyền
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); 

const router = express.Router();

// --- Public Routes ---
// Endpoint chính để lấy tất cả bình luận của một sản phẩm (Ai cũng có thể xem)
router.get('/product/:productId', commentController.getByProduct);

// --- Customer Routes ---
// Khách hàng đã đăng nhập có thể tạo một bình luận mới
router.post('/', 
    authenticateToken, 
    authorizeRole('customer'), 
    commentController.createComment
);

// Khách hàng đã đăng nhập có thể cập nhật bình luận của chính mình
router.put('/:id', 
    authenticateToken, 
    authorizeRole('customer'), 
    commentController.update
);

// --- Admin Routes ---
// Admin đã đăng nhập có thể trả lời một bình luận
router.post('/:parentId/reply', 
    authenticateToken, 
    authorizeRole('admin'), 
    commentController.createReply
);

// --- Shared Routes (Admin & Customer) ---
// Xóa một bình luận (Middleware xác thực chung, logic quyền sẽ được xử lý trong service)
router.delete('/:id', 
    authenticateToken, // Chỉ cần đăng nhập là được, quyền cụ thể sẽ kiểm tra sau
    commentController.deleteComment
);

router.get('/all',
    authenticateToken,
    authorizeRole('admin'),
    commentController.getAll
);


module.exports = router;


