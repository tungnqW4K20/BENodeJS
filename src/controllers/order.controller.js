'use strict';

const orderService = require('../services/order.service');

const create = async (req, res, next) => {
    try {
        
        const customerId = req.user.id; 
        const { items } = req.body; 

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu trường bắt buộc: items (danh sách sản phẩm không được rỗng).'
            });
        }

        for (const item of items) {
            if (
                !item.productId ||
                !item.colorProductId ||
                !item.sizeProductId ||
                !item.quantity ||
                typeof item.quantity !== 'number' ||
                item.quantity <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Mỗi mặt hàng phải có productId, colorProductId, sizeProductId là số và quantity là số > 0. Kiểm tra image_url là chuỗi (nếu có).'
                });
            }
             if (item.imageUrl && typeof item.imageUrl !== 'string') {
                 return res.status(400).json({
                    success: false,
                    message: 'imageUrl phải là một chuỗi nếu được cung cấp.'
                });
            }
        }


        const orderData = {
            customerId,
            items
        };

        const newOrder = await orderService.createOrder(orderData);

        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công!',
            data: newOrder
        });
    } catch (error) {
        console.error("Create Order Controller Error:", error.message);
        if (error.message.includes('không tồn tại') || error.message.includes('không thuộc sản phẩm')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('không đủ số lượng tồn kho')) {
            return res.status(409).json({ success: false, message: error.message }); 
        }
        if (error.message.includes('là bắt buộc') || error.message.includes('Mỗi mặt hàng phải có')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tạo đơn hàng.' });
    }
};



const getMyOrders = async (req, res, next) => {
    try {
        const customerId = req.user.id; 
        const { page, limit } = req.query;

        const result = await orderService.getOrdersByCustomerId(customerId, { page, limit });

        res.status(200).json({
            success: true,
            data: result.orders,
            pagination: {
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalItems: result.totalOrders
            }
        });
    } catch (error) {
        console.error("Get My Orders Controller Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách đơn hàng.' });
        
    }
};


const getMyOrderById = async (req, res, next) => {
    try {
        const customerId = req.user.id; 
        const orderId = req.params.id;

        if (isNaN(parseInt(orderId))) {
            return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ.' });
        }

        const order = await orderService.getOrderById(parseInt(orderId), customerId);

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Get My Order By ID Controller Error:", error.message);
        if (error.message.includes('Không tìm thấy') || error.message.includes('không có quyền truy cập')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy chi tiết đơn hàng.' });
    }
};


const getAllOrdersAdmin = async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await orderService.getAllOrders({ page, limit });

        res.status(200).json({
            success: true,
            data: result.orders,
            pagination: {
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalItems: result.totalOrders
            }
        });
    } catch (error) {
        console.error("Get All Orders Admin Controller Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách tất cả đơn hàng.' });
    }
};

const updateOrderStatusAdmin = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body; // 'status' ở đây là apiKey, vd: "processing"

        if (isNaN(parseInt(orderId))) {
            return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ.' });
        }
        if (!status || typeof status !== 'string') {
            return res.status(400).json({ success: false, message: 'Trường "status" là bắt buộc và phải là một chuỗi.' });
        }

        const updatedOrder = await orderService.updateOrderStatus(parseInt(orderId), status);

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công!',
            data: updatedOrder
        });
    } catch (error) {
        console.error("Admin Update Order Status Controller Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('không hợp lệ')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        // Các lỗi khác do service ném ra (ví dụ: không thể chuyển trạng thái)
        if (error.message.includes('Không thể chuyển trạng thái')) {
             return res.status(409).json({ success: false, message: error.message }); // 409 Conflict
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi cập nhật trạng thái đơn hàng.' });
    }
};

const getOrderStatusesAdmin = (req, res, next) => {
    try {
        const statuses = orderService.getAvailableOrderStatuses();
        res.status(200).json({
            success: true,
            data: statuses
        });
    } catch (error) {
        console.error("Admin Get Order Statuses Controller Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách trạng thái đơn hàng.' });
    }
};

const getByCustomerId = async (req, res, next) => {
    try {
        const loggedInUser = req.user; 
        const orders = await orderService.getOrdersByCustomerId(loggedInUser.id);
        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error("Get Orders By Customer ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message }); // 404 Not Found
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy lịch sử đơn hàng.' });
    }
};

module.exports = {
    create,
    getMyOrders,
    getMyOrderById,
    getAllOrdersAdmin,
    updateOrderStatusAdmin,  
    getOrderStatusesAdmin,
    getByCustomerId
};

