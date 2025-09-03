'use strict';

const customerService = require('../services/customer.service');

const create = async (req, res) => {
    try {
        const { name, email, address, username, password, phone } = req.body;

        if (!name || !email || !address || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Tên, email, địa chỉ và số điện thoại là các trường bắt buộc.'
            });
        }

        const newCustomer = await customerService.createCustomer({
            name,
            email,
            address,
            username,
            password,
            phone
        });

        return res.status(201).json({
            success: true,
            message: 'Đăng ký khách hàng thành công!',
            data: newCustomer
        });
    } catch (error) {
        console.error("Create Customer Error:", error.message);

        if (error.message.includes('đã tồn tại') || error.message.includes('đã được sử dụng')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        if (error.message.includes('bắt buộc') || error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ nội bộ khi tạo khách hàng.'
        });
    }
};

const getAll = async (req, res) => {
    try {
        const customers = await customerService.getAllCustomers();
        res.status(200).json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error("Get All Customers Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách khách hàng.' });
    }
};


const getById = async (req, res) => {
    try {
        const customerId = req.params.id;
        if (isNaN(parseInt(customerId))) {
            return res.status(400).json({ success: false, message: 'ID khách hàng không hợp lệ.' });
        }

        const customer = await customerService.getCustomerById(customerId);
        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error("Get Customer By ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message }); 
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy thông tin khách hàng.' });
    }
};


const update = async (req, res) => {
    try {
        const customerId = req.params.id;
        const updateData = req.body; 

        if (isNaN(parseInt(customerId))) {
            return res.status(400).json({ success: false, message: 'ID khách hàng không hợp lệ.' });
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu để cập nhật.'
            });
        }

        const updatedCustomer = await customerService.updateCustomer(customerId, updateData);

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin khách hàng thành công!',
            data: updatedCustomer
        });
    } catch (error) {
        console.error("Update Customer Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã được sử dụng') || error.message.includes('đã tồn tại')) {
            return res.status(409).json({ success: false, message: error.message });
        }
        if (error.name === 'SequelizeValidationError') {
             return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi cập nhật khách hàng.' });
    }
};


const deleteCtrl = async (req, res) => { 
    try {
        const customerId = req.params.id;

        if (isNaN(parseInt(customerId))) {
            return res.status(400).json({ success: false, message: 'ID khách hàng không hợp lệ.' });
        }

        await customerService.deleteCustomer(customerId);

        res.status(200).json({
            success: true,
            message: 'Xóa khách hàng thành công!'
        });
    } catch (error) {
        console.error("Delete Customer Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa khách hàng.' });
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    deleteCtrl 
};