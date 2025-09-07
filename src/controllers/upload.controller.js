'use strict';

const uploadService = require('../services/upload.service');


// OLD VERSION
// const uploadProductImage = async (req, res, next) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Không có tệp nào được tải lên hoặc tệp không hợp lệ.'
//             });
//         }

//         const imageUrl = await uploadService.handleProductImageUpload(req.file, req);

//         res.status(201).json({
//             success: true,
//             message: 'Tải ảnh sản phẩm thành công!',
//             data: {
//                 imageUrl: imageUrl
//             }
//         });
//     } catch (error) {
//         console.error("Upload Product Image Error:", error.message, error.stack);
        
//         res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tải ảnh lên.' });
//     }
// };

// NEW VERSION
// Controller
const uploadProductImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có tệp nào được tải lên hoặc tệp không hợp lệ.'
            });
        }

        // Lấy URL ảnh trực tiếp từ Cloudinary
        const imageUrl = await uploadService.handleProductImageUpload(req.file);

        res.status(201).json({
            success: true,
            message: 'Tải ảnh sản phẩm thành công!',
            data: {
                imageUrl: imageUrl
            }
        });
    } catch (error) {
        console.error("Upload Product Image Error:", error.message, error.stack);
        
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tải ảnh lên.' });
    }
};


// OLD VERSION
// const uploadMultipleProductImages = async (req, res, next) => {
//     try {
//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Không có tệp nào được tải lên hoặc các tệp không hợp lệ.'
//             });
//         }

//         const imageUrls = await uploadService.handleMultipleProductImagesUpload(req.files, req);

//         res.status(201).json({
//             success: true,
//             message: 'Tải nhiều ảnh sản phẩm thành công!',
//             data: {
//                 imageUrls: imageUrls
//             }
//         });
//     } catch (error) {
//         console.error("Upload Multiple Product Images Error:", error.message, error.stack); 
//         res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tải nhiều ảnh lên.' });
//     }
// };

// Controller
const uploadMultipleProductImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có tệp nào được tải lên hoặc các tệp không hợp lệ.'
            });
        }

        const imageUrls = await uploadService.handleMultipleProductImagesUpload(req.files);

        res.status(201).json({
            success: true,
            message: 'Tải nhiều ảnh sản phẩm thành công!',
            data: {
                imageUrls: imageUrls
            }
        });
    } catch (error) {
        console.error("Upload Multiple Product Images Error:", error.message, error.stack); 
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tải nhiều ảnh lên.' });
    }
};

module.exports = {
    uploadProductImage,
    uploadMultipleProductImages 
};