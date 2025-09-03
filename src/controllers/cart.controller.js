'use strict';

const cartService = require('../services/cart.service');


const addItem = async (req, res) => {
    try {
        const customerId = req.user.id; 
        const itemData = req.body; 

        const addedItem = await cartService.addItemToCart(customerId, itemData);

        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm vào giỏ hàng thành công!',
            data: addedItem
        });
    } catch (error) {
        console.error("Add to cart Error:", error.message);
        if (error.message.includes('bắt buộc') || error.message.includes('không tồn tại')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('không đủ')) {
            return res.status(409).json({ success: false, message: error.message }); 
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};


const getCart = async (req, res) => {
    try {
        const customerId = req.user.id;
        const cartItems = await cartService.getCustomerCart(customerId);
        res.status(200).json({
            success: true,
            data: cartItems
        });
    } catch (error) {
        console.error("Get Cart Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy giỏ hàng.' });
    }
};


const updateItem = async (req, res) => {
    try {
        const customerId = req.user.id;
        const itemId = req.params.itemId; 
        const { quantity } = req.body;

        if (!quantity) {
            return res.status(400).json({ success: false, message: 'Thiếu số lượng để cập nhật.' });
        }
        if (isNaN(parseInt(itemId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        const updatedItem = await cartService.updateCartItem(customerId, itemId, quantity);

        res.status(200).json({
            success: true,
            message: 'Cập nhật số lượng thành công!',
            data: updatedItem
        });
    } catch (error) {
        console.error("Update Cart Item Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('phải lớn hơn')) {
             return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};


const removeItem = async (req, res) => {
    try {
        const customerId = req.user.id;
        const itemId = req.params.itemId;
        
        if (isNaN(parseInt(itemId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        await cartService.removeCartItem(customerId, itemId);

        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công!'
        });
    } catch (error) {
        console.error("Remove Cart Item Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};

module.exports = {
    addItem,
    getCart,
    updateItem,
    removeItem
};