'use strict';

const db = require('../models'); 
const { sequelize, Customer, Product, ColorProduct, SizeProduct, Order, OrderDetail, Inventory } = db; 
const { Op } = db.Sequelize;


// Lấy các giá trị ENUM trực tiếp từ model
const ORDER_STATUS_MODEL_ENUM_VALUES = Order.rawAttributes.orderstatus.values; // Sẽ là ['0', '1', '2']

// Ánh xạ từ khóa API (thân thiện với người dùng) sang giá trị ENUM trong model
// API sẽ nhận đầu vào là các key này (vd: "pending", "processing")
const ORDER_STATUS_API_MAP = {
    pending: '0',
    processing: '1',
    confirmed: '1', // "confirmed" cũng có thể map tới '1'
    shipped: '2',
    completed: '2', // "completed" cũng có thể map tới '2'
    cancelled: '2', // "cancelled" cũng có thể map tới '2'
};

// Mô tả cho từng trạng thái (lấy từ comment của model nếu có)
const ORDER_STATUS_DESCRIPTIONS = {};
const comment = Order.rawAttributes.orderstatus.comment; // "0: Pending, 1: Processing/Confirmed, 2: Shipped/Completed/Cancelled"
if (comment) {
    comment.split(',').forEach(part => {
        const [key, ...valueParts] = part.trim().split(':');
        if (key && valueParts.length > 0 && ORDER_STATUS_MODEL_ENUM_VALUES.includes(key.trim())) {
            ORDER_STATUS_DESCRIPTIONS[key.trim()] = valueParts.join(':').trim();
        }
    });
}
// Fallback nếu comment không parse được hoặc không đủ chi tiết
ORDER_STATUS_MODEL_ENUM_VALUES.forEach(value => {
    if (!ORDER_STATUS_DESCRIPTIONS[value]) {
        switch (value) {
            case '0': ORDER_STATUS_DESCRIPTIONS[value] = 'Đang chờ xử lý'; break;
            case '1': ORDER_STATUS_DESCRIPTIONS[value] = 'Đang xử lý/Đã xác nhận'; break;
            case '2': ORDER_STATUS_DESCRIPTIONS[value] = 'Đã giao/Hoàn thành/Đã hủy'; break;
            default: ORDER_STATUS_DESCRIPTIONS[value] = `Trạng thái ${value}`;
        }
    }
});


const createOrder = async (orderData) => {
    const { customerId, items } = orderData;

    if (!customerId) {
        throw new Error('customerId là bắt buộc.');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Danh sách mặt hàng (items) là bắt buộc và không được rỗng.');
    }

    const transaction = await sequelize.transaction();

    try {
        const customer = await Customer.findByPk(customerId, { transaction });
        if (!customer) {
            await transaction.rollback();
            throw new Error(`Khách hàng với ID ${customerId} không tồn tại.`);
        }

        const newOrder = await Order.create({
            customer_id: customerId,
            orderstatus: '0', 
            orderdate: new Date()
        }, { transaction });

        const orderDetailsToCreate = [];
        const inventoryUpdates = [];

        for (const item of items) {
            if (!item.productId || !item.colorProductId || !item.sizeProductId || !item.quantity || item.quantity <= 0) {
                throw new Error('Mỗi mặt hàng phải có productId, colorProductId, sizeProductId và quantity > 0.');
            }

            const product = await Product.findByPk(item.productId, { transaction });
            const colorProduct = await ColorProduct.findByPk(item.colorProductId, { transaction });
            const sizeProduct = await SizeProduct.findByPk(item.sizeProductId, { transaction });

            console.log("check size: ", sizeProduct)

            if (!product) {
                throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
            }
            if (!colorProduct) {
                throw new Error(`Biến thể màu với ID ${item.colorProductId} không tồn tại.`);
            }
            if (!sizeProduct) {
                throw new Error(`Biến thể kích thước với ID ${item.sizeProductId} không tồn tại.`);
            }

            if (colorProduct.product_id !== product.id) {
                throw new Error(`Màu ID ${item.colorProductId} không thuộc sản phẩm ID ${product.id}.`);
            }
            if (sizeProduct.product_id !== product.id) {
                throw new Error(`Kích thước ID ${item.sizeProductId} không thuộc sản phẩm ID ${product.id}.`);
            }

            const inventoryItem = await Inventory.findOne({
                where: {
                    color_product_id: item.colorProductId,
                    size_product_id: item.sizeProductId
                },
                transaction
            });

            if (!inventoryItem || inventoryItem.quantity < item.quantity) {
                throw new Error(`Sản phẩm "${product.name}" (Màu: ${colorProduct.name}, Size: ${sizeProduct.name}) không đủ số lượng tồn kho. Yêu cầu: ${item.quantity}, Hiện có: ${inventoryItem ? inventoryItem.quantity : 0}.`);
            }

            
            const unitPrice = (Number(product.price) || 0) +
                              (Number(colorProduct.price) || 0) +
                              (Number(sizeProduct.price) || 0);

            orderDetailsToCreate.push({
                orders_id: newOrder.id,
                products_id: item.productId,
                color_product_id: item.colorProductId,
                size_product_id: item.sizeProductId,
                quantity: item.quantity,
                price: unitPrice, 
                image_url: item.imageUrl || product.image_url || null 
            });

            inventoryUpdates.push({
                inventoryItem: inventoryItem,
                quantityToDecrement: item.quantity
            });
        }

        // 4. Tạo các bản ghi OrderDetail
        await OrderDetail.bulkCreate(orderDetailsToCreate, { transaction });

        // 5. Cập nhật số lượng tồn kho (sau khi chắc chắn OrderDetail đã tạo thành công)
        for (const update of inventoryUpdates) {
            await update.inventoryItem.decrement('quantity', { by: update.quantityToDecrement, transaction });
        }

        // Nếu mọi thứ thành công, commit transaction
        await transaction.commit();

        // Lấy lại đơn hàng với đầy đủ chi tiết để trả về
        const createdOrderWithDetails = await Order.findByPk(newOrder.id, {
            include: [
                { model: Customer, as: 'customer' },
                {
                    model: OrderDetail,
                    as: 'orderDetails',
                    include: [
                        { model: Product, as: 'product' },
                        { model: ColorProduct, as: 'colorVariant' },
                        { model: SizeProduct, as: 'sizeVariant' }
                    ]
                }
            ]
        });

        return createdOrderWithDetails;

    } catch (error) {
        if (transaction.finished !== 'commit') {
             await transaction.rollback();
        }
        console.error("Create Order Service Error:", error.message);
        throw error; 
    }
};


// const getOrdersByCustomerId = async (customerId, options = {}) => {
//     const page = parseInt(options.page, 10) || 1;
//     const limit = parseInt(options.limit, 10) || 10;
//     const offset = (page - 1) * limit;

//     const { count, rows } = await Order.findAndCountAll({
//         where: { customer_id: customerId },
//         include: [
//             {
//                 model: OrderDetail,
//                 as: 'orderDetails',
//                 include: [
//                     { model: Product, as: 'product', attributes: ['id', 'name', 'image_url'] },
//                     { model: ColorProduct, as: 'colorVariant', attributes: ['id', 'name'] },
//                     { model: SizeProduct, as: 'sizeVariant', attributes: ['id', 'name'] }
//                 ]
//             }
//         ],
//         order: [['orderdate', 'DESC']],
//         limit,
//         offset
//     });

//     return {
//         totalPages: Math.ceil(count / limit),
//         currentPage: page,
//         totalOrders: count,
//         orders: rows
//     };
// };


const getOrderById = async (orderId, customerId = null) => {
    const whereCondition = { id: orderId };
    if (customerId) {
        whereCondition.customer_id = customerId; 
    }

    const order = await Order.findOne({
        where: whereCondition,
        include: [
            { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] },
            {
                model: OrderDetail,
                as: 'orderDetails',
                include: [
                    { model: Product, as: 'product', attributes: ['id', 'name'] },
                    { model: ColorProduct, as: 'colorVariant', attributes: ['id', 'name'] },
                    { model: SizeProduct, as: 'sizeVariant', attributes: ['id', 'name'] }
                ]
            }
        ]
    });

    if (!order) {
        if (customerId) {
            throw new Error(`Không tìm thấy đơn hàng với ID ${orderId} cho khách hàng này hoặc bạn không có quyền truy cập.`);
        }
        throw new Error(`Không tìm thấy đơn hàng với ID ${orderId}.`);
    }
    return order;
};


const getAllOrders = async (options = {}) => {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Order.findAndCountAll({
            include: [
                { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] }, 
                {
                    model: OrderDetail,
                    as: 'orderDetails',
                    include: [
                        { model: Product, as: 'product', attributes: ['id', 'name', 'image_url'] },
                        { model: ColorProduct, as: 'colorVariant', attributes: ['id', 'name'] },
                        { model: SizeProduct, as: 'sizeVariant', attributes: ['id', 'name'] }
                    ]
                }
            ],
            order: [['orderdate', 'DESC']],
            limit,
            offset
        });

        return {
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalOrders: count,
            orders: rows
        };
    } catch (error) {
        console.error("Get All Orders Service Error:", error.message);
        throw new Error('Lỗi khi lấy danh sách tất cả đơn hàng.');
    }
};

const updateOrderStatus = async (orderId, newStatusApiKey) => {
    const order = await Order.findByPk(orderId);
    if (!order) {
        throw new Error(`Không tìm thấy đơn hàng với ID ${orderId}.`);
    }

    // Chuyển newStatusApiKey (ví dụ: "processing") thành giá trị model (ví dụ: '1')
    const modelStatusValue = ORDER_STATUS_API_MAP[newStatusApiKey.toLowerCase()];

    if (!modelStatusValue || !ORDER_STATUS_MODEL_ENUM_VALUES.includes(modelStatusValue)) {
        const validApiKeys = Object.keys(ORDER_STATUS_API_MAP).join(', ');
        throw new Error(`Trạng thái '${newStatusApiKey}' không hợp lệ. Các trạng thái được chấp nhận: ${validApiKeys}.`);
    }

    

    order.orderstatus = modelStatusValue;
    await order.save();

    
    return getOrderById(orderId);
};


const getAvailableOrderStatuses = () => {
    // Đảm bảo mỗi modelValue chỉ xuất hiện một lần
    return ORDER_STATUS_MODEL_ENUM_VALUES.map(modelValue => {
        // Tìm một apiKey tương ứng (có thể có nhiều apiKey map tới cùng 1 modelValue, chọn 1 cái)
        const apiKey = Object.keys(ORDER_STATUS_API_MAP).find(key => ORDER_STATUS_API_MAP[key] === modelValue) || `status_val_${modelValue}`; // Fallback apiKey
        return {
            apiKey: apiKey, // Khóa dùng cho API
            modelValue: modelValue, // Giá trị lưu trong DB
            description: ORDER_STATUS_DESCRIPTIONS[modelValue] || `Trạng thái ${modelValue}` // Mô tả tiếng Việt
        };
    });
};

const getOrdersByCustomerId = async (customerId) => {
    const customer = await db.Customer.findByPk(customerId);
    if (!customer) {
        throw new Error(`Không tìm thấy khách hàng với ID ${customerId}.`);
    }

    const orders = await db.Order.findAll({
        where: { customer_id: customerId },
        order: [['orderdate', 'DESC']], 
        
        include: [
            {
                model: db.OrderDetail,
                as: 'orderDetails', 
                required: true,
                include: [
                    {
                        model: db.Product,
                        as: 'product',
                        attributes: ['name', 'description'] 
                    },
                    {
                        model: db.ColorProduct,
                        as: 'colorVariant',
                        attributes: ['name', 'colorCode', 'image_urls'] 
                    },
                    {
                        model: db.SizeProduct,
                        as: 'sizeVariant',
                        attributes: ['name'] 
                    }
                ]
            }
        ]
    });

    
    const plainOrders = orders.map(order => order.get({ plain: true }));

    plainOrders.forEach(order => {
        let totalAmount = 0;
        
        order.orderDetails.forEach(detail => {
            const price = parseFloat(detail.price);
            detail.subtotal = detail.quantity * price;
            totalAmount += detail.subtotal;
        });

        order.totalAmount = totalAmount;
    });

    return plainOrders;
};



module.exports = {
    createOrder,
    getOrdersByCustomerId,
    getOrderById,
    getAllOrders,
    updateOrderStatus,         
    getAvailableOrderStatuses  
};

