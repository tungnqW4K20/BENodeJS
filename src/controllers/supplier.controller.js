'use strict';

const supplierService = require('../services/supplier.service'); // Đường dẫn đến supplier service


const create = async (req, res, next) => {
    try {
        console.log("check ---: ", req.body)
        const { name, email, phonenumber } = req.body;

        

        if (!name || !email || !phonenumber) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu các trường bắt buộc: name, email, phonenumber'
            });
        }


        const newSupplier = await supplierService.createSupplier({ name, email, phonenumber });

        res.status(201).json({
            success: true,
            message: 'Tạo nhà cung cấp thành công!',
            data: newSupplier
        });
    } catch (error) {
        console.error("Create Supplier Error:", error.message);
        if (error.message.includes('đã tồn tại')) { 
            return res.status(409).json({ success: false, message: error.message }); 
        }
        if (error.message.includes('bắt buộc')) {
             return res.status(400).json({ success: false, message: error.message }); 
        }
        
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tạo nhà cung cấp.' });
        
    }
};


const getAll = async (req, res, next) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.status(200).json({
            success: true,
            data: suppliers
        });
    } catch (error) {
        console.error("Get All Suppliers Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách nhà cung cấp.' });
        
    }
};


const getById = async (req, res, next) => {
    try {
        const supplierId = req.params.id;
         if (isNaN(parseInt(supplierId))) {
            return res.status(400).json({ success: false, message: 'ID nhà cung cấp không hợp lệ.' });
        }

        const supplier = await supplierService.getSupplierById(supplierId);
        res.status(200).json({
            success: true,
            data: supplier
        });
    } catch (error) {
        console.error("Get Supplier By ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message }); 
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy thông tin nhà cung cấp.' });
        
    }
};


const update = async (req, res, next) => {
    try {
        const supplierId = req.params.id;
        const { name, email, phonenumber } = req.body; 

         if (isNaN(parseInt(supplierId))) {
            return res.status(400).json({ success: false, message: 'ID nhà cung cấp không hợp lệ.' });
        }

        
        if (name === undefined && email === undefined && phonenumber === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Cần cung cấp ít nhất một trường (name, email, hoặc phonenumber) để cập nhật.'
            });
        }
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phonenumber !== undefined) updateData.phonenumber = phonenumber;

        const updatedSupplier = await supplierService.updateSupplier(supplierId, updateData);

        res.status(200).json({
            success: true,
            message: 'Cập nhật nhà cung cấp thành công!',
            data: updatedSupplier
        });
    } catch (error) {
        console.error("Update Supplier Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message }); 
        }
        if (error.message.includes('đã tồn tại')) { 
            return res.status(409).json({ success: false, message: error.message }); 
        }
        if (error.message.includes('bắt buộc') || error.message.includes('Không có dữ liệu hợp lệ')) {
             return res.status(400).json({ success: false, message: error.message }); 
        }
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi cập nhật nhà cung cấp.' });
    }
};

const deleteSupplier = async (req, res, next) => { 
    try {
        const supplierId = req.params.id;

         if (isNaN(parseInt(supplierId))) {
            return res.status(400).json({ success: false, message: 'ID nhà cung cấp không hợp lệ.' });
        }

        await supplierService.deleteSupplier(supplierId);

        res.status(200).json({ 
            success: true,
            message: 'Xóa nhà cung cấp thành công!'
        });
    } catch (error) {
        console.error("Delete Supplier Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message }); 
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa nhà cung cấp.' });
        // next(error);
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    deleteSupplier 
};