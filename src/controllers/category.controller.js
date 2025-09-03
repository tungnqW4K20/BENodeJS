'use strict';

const categoryService = require('../services/category.service');

const create = async (req, res, next) => {
    try {
        const { name, image_url } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu trường bắt buộc: name'
            });
        }

        const newCategory = await categoryService.createCategory({ name, image_url });

        res.status(201).json({
            success: true,
            message: 'Tạo category thành công!',
            data: newCategory
        });
    } catch (error) {
        console.error("Create Category Error:", error.message);
        if (error.message.includes('đã tồn tại')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        if (error.message.includes('bắt buộc')) {
             return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tạo category.' });
    }
};

const getAll = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Get All Categories Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách category.' });
    }
};

const getById = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
         if (isNaN(parseInt(categoryId))) {
            return res.status(400).json({ success: false, message: 'ID category không hợp lệ.' });
        }

        const category = await categoryService.getCategoryById(categoryId);
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error("Get Category By ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(44).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy thông tin category.' });
    }
};

const update = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const { name, image_url } = req.body;

        if (isNaN(parseInt(categoryId))) {
            return res.status(400).json({ success: false, message: 'ID category không hợp lệ.' });
        }
        
        if (!name && image_url === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Cần cung cấp ít nhất một trường (name hoặc image_url) để cập nhật.'
            });
        }

        const updatedCategory = await categoryService.updateCategory(categoryId, { name, image_url });

        res.status(200).json({
            success: true,
            message: 'Cập nhật category thành công!',
            data: updatedCategory
        });
    } catch (error) {
        console.error("Update Category Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã tồn tại')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        if (error.message.includes('bắt buộc') || error.message.includes('cung cấp ít nhất')) {
             return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi cập nhật category.' });
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

         if (isNaN(parseInt(categoryId))) {
            return res.status(400).json({ success: false, message: 'ID category không hợp lệ.' });
        }

        await categoryService.deleteCategory(categoryId);

        res.status(200).json({
            success: true,
            message: 'Xóa category thành công!'
        });
    } catch (error) {
        console.error("Delete Category Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa category.' });
    }
};


module.exports = {
    create,
    getAll,
    getById,
    update,
    deleteCategory
};