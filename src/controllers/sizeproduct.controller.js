'use strict';

const sizeProductService = require('../services/sizeproduct.service');
const { Sequelize } = require('../models');


const create = async (req, res) => {
    try {
        const product_id = req.params.productId || req.body.product_id;
        const { name, price, description } = req.body;

        if (!product_id) {
             return res.status(400).json({ success: false, message: 'Thiếu Product ID của sản phẩm gốc.' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Thiếu Tên kích thước cho biến thể.' });
        }

        const data = { product_id: parseInt(product_id), name, price, description };
        const newSizeProduct = await sizeProductService.createSizeProduct(data);

        res.status(201).json({
            success: true,
            message: 'Tạo biến thể kích thước sản phẩm thành công!',
            data: newSizeProduct
        });
    } catch (error) {
        console.error("Create SizeProduct Error:", error.message);
        if (error instanceof Sequelize.ValidationError) {
             return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
        }
        if (error.message.includes('bắt buộc') || error.message.includes('Không tìm thấy sản phẩm gốc')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã có một biến thể kích thước')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tạo biến thể kích thước sản phẩm.' });
    }
};


const getAllByProductId = async (req, res) => {
    try {
        const productId = req.params.productId;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'Product ID không hợp lệ.' });
        }

        const sizeProducts = await sizeProductService.getAllSizeProductsByProductId(parseInt(productId));
        res.status(200).json({ success: true, data: sizeProducts });
    } catch (error) {
        console.error("Get All SizeProducts by ProductId Error:", error.message);
         if (error.message.includes('Không tìm thấy sản phẩm gốc')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách biến thể kích thước.' });
    }
};


const getById = async (req, res) => {
    try {
        const sizeProductId = req.params.id;
         if (isNaN(parseInt(sizeProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể kích thước không hợp lệ.' });
        }
        const sizeProduct = await sizeProductService.getSizeProductById(parseInt(sizeProductId));
        res.status(200).json({ success: true, data: sizeProduct });
    } catch (error) {
        console.error("Get SizeProduct By ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy thông tin biến thể kích thước.' });
    }
};


const update = async (req, res) => {
    try {
        const sizeProductId = req.params.id;
        if (isNaN(parseInt(sizeProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể kích thước không hợp lệ.' });
        }
        const updateData = req.body;
        if (Object.keys(updateData).length === 0) {
             return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật.' });
        }
        const updatedSizeProduct = await sizeProductService.updateSizeProduct(parseInt(sizeProductId), updateData);
        res.status(200).json({
            success: true,
            message: 'Cập nhật biến thể kích thước thành công!',
            data: updatedSizeProduct
        });
    } catch (error) {
        console.error("Update SizeProduct Error:", error.message);
        if (error instanceof Sequelize.ValidationError) {
             return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
        }
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã có một biến thể kích thước khác')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi cập nhật biến thể kích thước.' });
    }
};


const hardDelete = async (req, res) => {
    try {
        const sizeProductId = req.params.id;
         if (isNaN(parseInt(sizeProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể kích thước không hợp lệ.' });
        }
        await sizeProductService.hardDeleteSizeProduct(parseInt(sizeProductId));
        res.status(200).json({
            success: true,
            message: 'Xóa vĩnh viễn biến thể kích thước thành công!'
        });
    } catch (error) {
        console.error("Hard Delete SizeProduct Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa vĩnh viễn biến thể kích thước.' });
    }
};


const softDelete = async (req, res) => {
    try {
        const sizeProductId = req.params.id;
        if (isNaN(parseInt(sizeProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể kích thước không hợp lệ.' });
        }
        await sizeProductService.softDeleteSizeProduct(parseInt(sizeProductId));
        res.status(200).json({
            success: true,
            message: 'Xóa mềm biến thể kích thước thành công!'
        });
    } catch (error) {
        console.error("Soft Delete SizeProduct Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa mềm biến thể kích thước.' });
    }
};


const restore = async (req, res) => {
    try {
        const sizeProductId = req.params.id;
        if (isNaN(parseInt(sizeProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể kích thước không hợp lệ.' });
        }
        const restoredSizeProduct = await sizeProductService.restoreSizeProduct(parseInt(sizeProductId));
        res.status(200).json({
            success: true,
            message: 'Khôi phục biến thể kích thước thành công!',
            data: restoredSizeProduct
        });
    } catch (error) {
        console.error("Restore SizeProduct Error:", error.message);
        if (error.message.includes('Không tìm thấy') || error.message.includes('chưa bị xóa mềm')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi khôi phục biến thể kích thước.' });
    }
};


const getAllIncludingDeleted = async (req, res) => {
    try {
        const productId = req.params.productId;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'Product ID không hợp lệ.' });
        }
        const sizeProducts = await sizeProductService.getAllSizeProductsIncludingDeleted(parseInt(productId));
        res.status(200).json({ success: true, data: sizeProducts });
    } catch (error) {
        console.error("Get All SizeProducts (inc. deleted) Error:", error.message);
         if (error.message.includes('Không tìm thấy sản phẩm gốc')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách biến thể kích thước (bao gồm đã xóa).' });
    }
};

module.exports = {
    create,
    getAllByProductId,
    getById,
    update,
    delete: hardDelete,
    softDelete,
    restore,
    getAllIncludingDeleted
};