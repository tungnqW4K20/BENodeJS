// src/controllers/inventoryController.js
'use strict';
const inventoryService = require('../services/inventoryService');

const getByProductId = async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        if (isNaN(productId)) {
            return res.status(400).json({ success: false, message: 'Product ID không hợp lệ.' });
        }
        const data = await inventoryService.getInventoryForProduct(productId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Get Inventory by ProductId Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};

const batchUpdate = async (req, res) => {
    try {
        const inventoryData = req.body.inventory; // Expect an array of inventory items
        if (!Array.isArray(inventoryData)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu đầu vào phải là một mảng.' });
        }
        await inventoryService.batchUpdateInventory(inventoryData);
        res.status(200).json({ success: true, message: 'Cập nhật tồn kho thành công.' });
    } catch (error) {
        console.error("Batch Update Inventory Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getByProductId,
    batchUpdate,
};