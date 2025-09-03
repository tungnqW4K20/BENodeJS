'use strict';
const importService = require('../services/import.service');

const create = async (req, res) => {
    try {
        const newInvoice = await importService.createImportInvoice(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo hóa đơn nhập hàng (nháp) thành công!',
            data: newInvoice
        });
    } catch (error) {
        console.error("Create Import Invoice Error:", error.message);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const complete = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID hóa đơn không hợp lệ.' });
        }

        const completedInvoice = await importService.completeImportAndUpdateInventory(id);

        res.status(200).json({
            success: true,
            message: `Hoàn thành hóa đơn ID ${id} và cập nhật tồn kho thành công!`,
            data: completedInvoice
        });
    } catch (error) {
        console.error("Complete Import Invoice Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        return res.status(409).json({
            success: false,
            message: error.message
        });
    }
};

const getAll = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const options = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10
        };
        const result = await importService.getAllImportInvoices(options);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("Get All Import Invoices Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách hóa đơn.' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID hóa đơn không hợp lệ.' });
        }

        const invoice = await importService.getImportInvoiceById(id);
        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        console.error("Get Import Invoice By ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy chi tiết hóa đơn.' });
    }
};

module.exports = {
    create,
    complete,
    getAll,
    getById
};