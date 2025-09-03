'use strict';

const express = require('express');
const uploadController = require('../controllers/upload.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const uploadMiddleware = require('../middlewares/upload.middleware'); 
const multer = require('multer'); 

const router = express.Router();

router.post(
    '/product-image',
    authenticateToken,
    authorizeRole("admin"),
    uploadMiddleware.single('productImage'), 
    uploadController.uploadProductImage
);


router.post(
    '/product-multi-images', 
    authenticateToken,
    authorizeRole("admin"),
    uploadMiddleware.array('productImages', 10), 
    uploadController.uploadMultipleProductImages
);


router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("MulterError in route:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ success: false, message: 'Kích thước một hoặc nhiều tệp quá lớn. Tối đa 5MB mỗi tệp.' });
        }
        return res.status(400).json({ success: false, message: `Lỗi tải lên: ${err.message}` });
    } else if (err) {
        console.error("Non-MulterError in route but caught by handler:", err);
        if (err.message && err.message.includes('Chỉ cho phép tải lên tệp hình ảnh!')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        return res.status(500).json({ success: false, message: err.message || 'Đã có lỗi xảy ra.' });
    }
    next();
});


module.exports = router;