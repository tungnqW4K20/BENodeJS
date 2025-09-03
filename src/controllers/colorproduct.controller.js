'use strict';

const colorProductService = require('../services/colorproduct.service'); // Adjust path
const { Sequelize } = require('../models'); // For instanceof Sequelize.ValidationError


const create = async (req, res) => {
    try {
       
        const product_id = req.params.productId || req.body.product_id;
        const { name, price, description, image_urls, colorCode } = req.body;

        if (!product_id) {
             return res.status(400).json({ success: false, message: 'Thiếu Product ID của sản phẩm gốc.' });
        }
        if (!name) {
            return res.status(400).json({ success: false, message: 'Thiếu Tên màu cho biến thể.' });
        }

        const data = {
            product_id: parseInt(product_id),
            name,
            price,
            description,
            image_urls,
            colorCode
        };
        const newColorProduct = await colorProductService.createColorProduct(data);

        res.status(201).json({
            success: true,
            message: 'Tạo biến thể màu sắc sản phẩm thành công!',
            data: newColorProduct
        });
    } catch (error) {
        console.error("Create ColorProduct Error:", error.message);
        if (error instanceof Sequelize.ValidationError) {
             return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
        }
        if (error.message.includes('bắt buộc') || error.message.includes('Không tìm thấy sản phẩm gốc')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã có một biến thể màu')) {
            return res.status(409).json({ success: false, message: error.message }); 
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tạo biến thể màu sắc sản phẩm.' });
    }
};


const getAllByProductId = async (req, res) => {
    try {
        const productId = req.params.productId;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'Product ID không hợp lệ.' });
        }

        const colorProducts = await colorProductService.getAllColorProductsByProductId(parseInt(productId));
        res.status(200).json({
            success: true,
            data: colorProducts
        });
    } catch (error) {
        console.error("Get All ColorProducts by ProductId Error:", error.message);
         if (error.message.includes('Không tìm thấy sản phẩm gốc')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách biến thể màu của sản phẩm.' });
    }
};


const getById = async (req, res) => {
    try {
        const colorProductId = req.params.id;
         if (isNaN(parseInt(colorProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể màu sắc sản phẩm không hợp lệ.' });
        }

        const colorProduct = await colorProductService.getColorProductById(parseInt(colorProductId));
        res.status(200).json({
            success: true,
            data: colorProduct
        });
    } catch (error) {
        console.error("Get ColorProduct By ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy thông tin biến thể màu sắc sản phẩm.' });
    }
};



const update = async (req, res) => {
    try {
        const colorProductId = req.params.id;
        if (isNaN(parseInt(colorProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể màu sắc sản phẩm không hợp lệ.' });
        }

        const updateData = req.body; 
        if (Object.keys(updateData).length === 0) {
             return res.status(400).json({ success: false, message: 'Không có dữ liệu nào được cung cấp để cập nhật.' });
        }

        const updatedColorProduct = await colorProductService.updateColorProduct(parseInt(colorProductId), updateData);

        res.status(200).json({
            success: true,
            message: 'Cập nhật biến thể màu sắc sản phẩm thành công!',
            data: updatedColorProduct
        });
    } catch (error) {
        console.error("Update ColorProduct Error:", error.message);
        if (error instanceof Sequelize.ValidationError) {
             return res.status(400).json({ success: false, message: error.errors.map(e => e.message).join(', ') });
        }
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã có một biến thể màu khác')) {
            return res.status(409).json({ success: false, message: error.message }); 
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi cập nhật biến thể màu sắc sản phẩm.' });
    }
};


const hardDelete = async (req, res) => { 
    try {
        const colorProductId = req.params.id;
         if (isNaN(parseInt(colorProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể màu sắc sản phẩm không hợp lệ.' });
        }

        await colorProductService.hardDeleteColorProduct(parseInt(colorProductId));

        res.status(200).json({
            success: true,
            message: 'Xóa vĩnh viễn biến thể màu sắc sản phẩm thành công!'
        });
    } catch (error) {
        console.error("Hard Delete ColorProduct Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa vĩnh viễn biến thể màu sắc sản phẩm.' });
    }
};


const softDelete = async (req, res) => {
    try {
        const colorProductId = req.params.id;
        if (isNaN(parseInt(colorProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể màu sắc sản phẩm không hợp lệ.' });
        }

        await colorProductService.softDeleteColorProduct(parseInt(colorProductId));

        res.status(200).json({
            success: true,
            message: 'Xóa mềm biến thể màu sắc sản phẩm thành công!'
        });
    } catch (error) {
        console.error("Soft Delete ColorProduct Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa mềm biến thể màu sắc sản phẩm.' });
    }
};



const restore = async (req, res) => {
    try {
        const colorProductId = req.params.id;
        if (isNaN(parseInt(colorProductId))) {
            return res.status(400).json({ success: false, message: 'ID biến thể màu sắc sản phẩm không hợp lệ.' });
        }

        const restoredColorProduct = await colorProductService.restoreColorProduct(parseInt(colorProductId));

        res.status(200).json({
            success: true,
            message: 'Khôi phục biến thể màu sắc sản phẩm thành công!',
            data: restoredColorProduct
        });
    } catch (error) {
        console.error("Restore ColorProduct Error:", error.message);
        if (error.message.includes('Không tìm thấy') || error.message.includes('chưa bị xóa mềm')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi khôi phục biến thể màu sắc sản phẩm.' });
    }
};


const getAllIncludingDeleted = async (req, res) => {
    try {
        const productId = req.params.productId;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'Product ID không hợp lệ.' });
        }

        const colorProducts = await colorProductService.getAllColorProductsIncludingDeleted(parseInt(productId));
        res.status(200).json({
            success: true,
            data: colorProducts
        });
    } catch (error) {
        console.error("Get All ColorProducts (inc. deleted) by ProductId Error:", error.message);
         if (error.message.includes('Không tìm thấy sản phẩm gốc')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách biến thể màu của sản phẩm (bao gồm đã xóa).' });
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