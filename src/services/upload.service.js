'use strict';

const path = require('path');

const handleProductImageUpload = async (file, req) => {
    if (!file) {
        throw new Error('Không có thông tin tệp đơn để xử lý.');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/products/${file.filename}`;

    return imageUrl;
};

const handleMultipleProductImagesUpload = async (files, req) => {
    if (!files || files.length === 0) {
        throw new Error('Không có thông tin tệp để xử lý.');
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrls = files.map(file => {
        return `${baseUrl}/uploads/products/${file.filename}`;
    });

    return imageUrls;
};

module.exports = {
    handleProductImageUpload,
    handleMultipleProductImagesUpload 
};