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
    cancelled: '3', // "cancelled" cũng có thể map tới '2'
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


// const createOrder = async (orderData) => {
//     const { customerId, items } = orderData;

//     if (!customerId) {
//         throw new Error('customerId là bắt buộc.');
//     }
//     if (!items || !Array.isArray(items) || items.length === 0) {
//         throw new Error('Danh sách mặt hàng (items) là bắt buộc và không được rỗng.');
//     }

//     const transaction = await sequelize.transaction();

//     try {
//         const customer = await Customer.findByPk(customerId, { transaction });
//         if (!customer) {
//             await transaction.rollback();
//             throw new Error(`Khách hàng với ID ${customerId} không tồn tại.`);
//         }

//         const newOrder = await Order.create({
//             customer_id: customerId,
//             orderstatus: '0', 
//             orderdate: new Date()
//         }, { transaction });

//         const orderDetailsToCreate = [];
//         const inventoryUpdates = [];

//         for (const item of items) {
//             if (!item.productId || !item.colorProductId || !item.sizeProductId || !item.quantity || item.quantity <= 0) {
//                 throw new Error('Mỗi mặt hàng phải có productId, colorProductId, sizeProductId và quantity > 0.');
//             }

//             const product = await Product.findByPk(item.productId, { transaction });
//             const colorProduct = await ColorProduct.findByPk(item.colorProductId, { transaction });
//             const sizeProduct = await SizeProduct.findByPk(item.sizeProductId, { transaction });

//             console.log("check size: ", sizeProduct)

//             if (!product) {
//                 throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
//             }
//             if (!colorProduct) {
//                 throw new Error(`Biến thể màu với ID ${item.colorProductId} không tồn tại.`);
//             }
//             if (!sizeProduct) {
//                 throw new Error(`Biến thể kích thước với ID ${item.sizeProductId} không tồn tại.`);
//             }

//             if (colorProduct.product_id !== product.id) {
//                 throw new Error(`Màu ID ${item.colorProductId} không thuộc sản phẩm ID ${product.id}.`);
//             }
//             if (sizeProduct.product_id !== product.id) {
//                 throw new Error(`Kích thước ID ${item.sizeProductId} không thuộc sản phẩm ID ${product.id}.`);
//             }

//             const inventoryItem = await Inventory.findOne({
//                 where: {
//                     color_product_id: item.colorProductId,
//                     size_product_id: item.sizeProductId
//                 },
//                 transaction
//             });

//             if (!inventoryItem || inventoryItem.quantity < item.quantity) {
//                 throw new Error(`Sản phẩm "${product.name}" (Màu: ${colorProduct.name}, Size: ${sizeProduct.name}) không đủ số lượng tồn kho. Yêu cầu: ${item.quantity}, Hiện có: ${inventoryItem ? inventoryItem.quantity : 0}.`);
//             }

            
//             const unitPrice = (Number(product.price) || 0) +
//                               (Number(colorProduct.price) || 0) +
//                               (Number(sizeProduct.price) || 0);

//             orderDetailsToCreate.push({
//                 orders_id: newOrder.id,
//                 products_id: item.productId,
//                 color_product_id: item.colorProductId,
//                 size_product_id: item.sizeProductId,
//                 quantity: item.quantity,
//                 price: unitPrice, 
//                 image_url: item.imageUrl || product.image_url || null 
//             });

//             inventoryUpdates.push({
//                 inventoryItem: inventoryItem,
//                 quantityToDecrement: item.quantity
//             });
//         }

//         // 4. Tạo các bản ghi OrderDetail
//         await OrderDetail.bulkCreate(orderDetailsToCreate, { transaction });

//         // 5. Cập nhật số lượng tồn kho (sau khi chắc chắn OrderDetail đã tạo thành công)
//         for (const update of inventoryUpdates) {
//             await update.inventoryItem.decrement('quantity', { by: update.quantityToDecrement, transaction });
//         }

//         // Nếu mọi thứ thành công, commit transaction
//         await transaction.commit();

//         // Lấy lại đơn hàng với đầy đủ chi tiết để trả về
//         const createdOrderWithDetails = await Order.findByPk(newOrder.id, {
//             include: [
//                 { model: Customer, as: 'customer' },
//                 {
//                     model: OrderDetail,
//                     as: 'orderDetails',
//                     include: [
//                         { model: Product, as: 'product' },
//                         { model: ColorProduct, as: 'colorVariant' },
//                         { model: SizeProduct, as: 'sizeVariant' }
//                     ]
//                 }
//             ]
//         });

//         return createdOrderWithDetails;

//     } catch (error) {
//         if (transaction.finished !== 'commit') {
//              await transaction.rollback();
//         }
//         console.error("Create Order Service Error:", error.message);
//         throw error; 
//     }
// };

/**
 * @summary Tạo một đơn hàng mới, giảm số lượng tồn kho.
 * @description Hàm này được thiết kế để có thể hoạt động độc lập hoặc là một phần của một transaction lớn hơn.
 * @param {object} orderData - Dữ liệu đơn hàng, bao gồm customerId và items.
 * @param {import('sequelize').Transaction | null} [existingTransaction=null] - Một transaction Sequelize đang hoạt động (tùy chọn).
 * @returns {Promise<Order>} Đối tượng Order vừa được tạo với đầy đủ chi tiết.
 * @throws {Error} Ném lỗi nếu có bất kỳ vấn đề nào trong quá trình tạo đơn hàng.
 */
const createOrder = async (orderData, existingTransaction = null) => {
    const { customerId, items } = orderData;

    // --- Validation đầu vào ---
    if (!customerId) {
        throw new Error('customerId là bắt buộc.');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Danh sách mặt hàng (items) là bắt buộc và không được rỗng.');
    }

    // --- Quản lý Transaction ---
    // Nếu có transaction được truyền vào, hãy sử dụng nó.
    // Nếu không, hãy tạo một transaction mới.
    const transaction = existingTransaction || (await sequelize.transaction());

    try {
        // 1. Kiểm tra sự tồn tại của khách hàng
        const customer = await Customer.findByPk(customerId, { transaction });
        if (!customer) {
            // Không cần rollback ở đây vì khối catch sẽ xử lý
            throw new Error(`Khách hàng với ID ${customerId} không tồn tại.`);
        }

        // 2. Tạo bản ghi Order chính
        const newOrder = await Order.create({
            customer_id: customerId,
            orderstatus: '0', // Trạng thái mặc định là 'Pending'
            orderdate: new Date()
        }, { transaction });

        const orderDetailsToCreate = [];
        const inventoryUpdates = [];

        // 3. Lặp qua từng sản phẩm trong đơn hàng để kiểm tra và chuẩn bị dữ liệu
        for (const item of items) {
            // Validation cho từng item
            if (!item.productId || !item.colorProductId || !item.sizeProductId || !item.quantity || item.quantity <= 0) {
                throw new Error('Mỗi mặt hàng phải có productId, colorProductId, sizeProductId và quantity > 0.');
            }

            // Truy vấn thông tin sản phẩm, màu, size trong cùng transaction
            const product = await Product.findByPk(item.productId, { transaction });
            const colorProduct = await ColorProduct.findByPk(item.colorProductId, { transaction });
            const sizeProduct = await SizeProduct.findByPk(item.sizeProductId, { transaction });

            // Kiểm tra sự tồn tại
            if (!product) throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại.`);
            if (!colorProduct) throw new Error(`Biến thể màu với ID ${item.colorProductId} không tồn tại.`);
            if (!sizeProduct) throw new Error(`Biến thể kích thước với ID ${item.sizeProductId} không tồn tại.`);

            // Kiểm tra tính hợp lệ của sản phẩm (màu và size phải thuộc đúng sản phẩm)
            if (colorProduct.product_id !== product.id) {
                throw new Error(`Màu ID ${item.colorProductId} không thuộc sản phẩm ID ${product.id}.`);
            }
            if (sizeProduct.product_id !== product.id) {
                throw new Error(`Kích thước ID ${item.sizeProductId} không thuộc sản phẩm ID ${product.id}.`);
            }

            // Kiểm tra số lượng tồn kho
            const inventoryItem = await Inventory.findOne({
                where: {
                    color_product_id: item.colorProductId,
                    size_product_id: item.sizeProductId
                },
                lock: transaction.LOCK.UPDATE, // Khóa bản ghi inventory để tránh race condition
                transaction
            });

            if (!inventoryItem || inventoryItem.quantity < item.quantity) {
                throw new Error(`Sản phẩm "${product.name}" (Màu: ${colorProduct.name}, Size: ${sizeProduct.name}) không đủ số lượng tồn kho. Yêu cầu: ${item.quantity}, Hiện có: ${inventoryItem ? inventoryItem.quantity : 0}.`);
            }

            // Tính giá của sản phẩm tại thời điểm đặt hàng
            const unitPrice = (Number(product.price) || 0) +
                              (Number(colorProduct.price) || 0) +
                              (Number(sizeProduct.price) || 0);

            // Chuẩn bị dữ liệu để tạo OrderDetail
            orderDetailsToCreate.push({
                orders_id: newOrder.id,
                products_id: item.productId,
                color_product_id: item.colorProductId,
                size_product_id: item.sizeProductId,
                quantity: item.quantity,
                price: unitPrice,
                image_url: item.imageUrl || product.image_url || null
            });

            // Chuẩn bị dữ liệu để cập nhật Inventory
            inventoryUpdates.push({
                inventoryItem: inventoryItem,
                quantityToDecrement: item.quantity
            });
        }

        // 4. Tạo đồng loạt các bản ghi OrderDetail (hiệu quả hơn)
        await OrderDetail.bulkCreate(orderDetailsToCreate, { transaction });

        // 5. Cập nhật (giảm) số lượng tồn kho
        for (const update of inventoryUpdates) {
            await update.inventoryItem.decrement('quantity', { by: update.quantityToDecrement, transaction });
        }

        // --- Quản lý Transaction (Commit) ---
        // Chỉ commit transaction nếu nó được tạo bởi chính hàm này.
        // Nếu nó được truyền từ bên ngoài, hàm cha sẽ chịu trách nhiệm commit.
        if (!existingTransaction) {
            await transaction.commit();
        }

        // 6. Lấy lại đơn hàng với đầy đủ chi tiết để trả về
        const createdOrderWithDetails = await Order.findByPk(newOrder.id, {
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
            // Không cần transaction ở đây nữa vì đã commit
        });

        return createdOrderWithDetails;

    } catch (error) {
        // --- Quản lý Transaction (Rollback) ---
        // Chỉ rollback transaction nếu nó được tạo bởi chính hàm này và chưa hoàn tất.
        if (!existingTransaction && transaction && !transaction.finished) {
             await transaction.rollback();
        }
        console.error("Create Order Service Error:", error.message);
        // Ném lỗi lên tầng controller để xử lý
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

    const modelStatusValue = ORDER_STATUS_API_MAP[newStatusApiKey.toLowerCase()];

    if (!modelStatusValue || !ORDER_STATUS_MODEL_ENUM_VALUES.includes(modelStatusValue)) {
        const validApiKeys = Object.keys(ORDER_STATUS_API_MAP).join(', ');
        throw new Error(`Trạng thái '${newStatusApiKey}' không hợp lệ. Các trạng thái được chấp nhận: ${validApiKeys}.`);
    }

    if (
        newStatusApiKey.toLowerCase() === "cancelled" &&
        order.orderstatus === "2"
    ) {
        throw new Error("Không thể chuyển trạng thái từ 'shipped/completed' sang 'cancelled'.");
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

async function removeItemsFromCart(customerId, items) {
    for (const item of items) {
        await db.CartItem.destroy({
            where: {
                customer_id: customerId,
                product_id: item.productId,
                color_product_id: item.colorProductId,
                size_product_id: item.sizeProductId
            }
        });
    }
}


/**
 * @summary Tìm khách hàng bằng email hoặc tạo mới nếu chưa có.
 * @description Hàm này đảm bảo không tạo khách hàng trùng lặp.
 * @returns {Promise<Customer>} Đối tượng khách hàng đã tồn tại hoặc vừa được tạo.
 */
const findOrCreateCustomer = async (customerInfo, transaction) => {
    const { email, phone, name, address } = customerInfo;

    // Ưu tiên tìm bằng email vì nó là unique
    let customer = await Customer.findOne({
        where: { email: email },
        transaction
    });

    // Nếu tìm thấy khách hàng, cập nhật lại thông tin mới nhất của họ
    if (customer) {
        // Kiểm tra xem khách hàng này đã có tài khoản (username/password) chưa.
        // Nếu có, không cho phép khách vãng lai đặt hàng bằng email này để tránh xung đột.
        if (customer.username && customer.password) {
            throw new Error(`Email đã được sử dụng cho một tài khoản đã đăng ký. Vui lòng đăng nhập để đặt hàng.`);
        }
        
        // Cập nhật thông tin nếu có thay đổi
        customer.name = name;
        customer.phone = phone;
        customer.address = address;
        await customer.save({ transaction });
        
    } else {
        // Nếu không tìm thấy, tạo khách hàng mới
        customer = await Customer.create({
            name,
            email,
            phone,
            address,
            // username và password để null vì đây là khách vãng lai
        }, { transaction });
    }

    return customer;
};


const createOrderForGuest = async (orderData) => {
    const { customerInfo, items } = orderData;

    if (!customerInfo) {
        throw new Error('customerInfo là bắt buộc.');
    }
     if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Danh sách mặt hàng (items) là bắt buộc và không được rỗng.');
    }


    const transaction = await sequelize.transaction();
    try {
        // Bước 1: Tìm hoặc tạo khách hàng mới
        const customer = await findOrCreateCustomer(customerInfo, transaction);

        // Bước 2: Gọi lại hàm createOrder gốc với customerId đã có
        // Chúng ta tái sử dụng logic đã có để không lặp lại code
        const newOrder = await createOrder({
            customerId: customer.id,
            items: items
        }, transaction); // Truyền transaction vào hàm createOrder

        // Nếu mọi thứ thành công, commit transaction
        // Lưu ý: `createOrder` sẽ tự quản lý transaction của nó, nên cần điều chỉnh
        // Ở đây, chúng ta sẽ copy logic của createOrder vào đây để quản lý chung một transaction

        await transaction.commit(); // Commit transaction ở hàm cha

        return newOrder;

    } catch (error) {
        await transaction.rollback();
        console.error("Create Order For Guest Service Error:", error.message);
        throw error;
    }
};


const getPurchasedProductsByCustomerId = async (customerId) => {
    try {
        const customer = await db.Customer.findByPk(customerId);
        if (!customer) {
            throw new Error(`Không tìm thấy khách hàng với ID ${customerId}.`);
        }

        const purchasedItems = await db.OrderDetail.findAll({
            attributes: [
                // Chỉ lấy các trường cần thiết và có thể gộp nhóm
                [sequelize.fn('DISTINCT', sequelize.col('product.id')), 'productId'],
                'product.name',
                'colorVariant.name',
                'colorVariant.image_urls',
                'sizeVariant.name',
                'image_url',

            ],
            include: [
                {
                    model: db.Order,
                    as: 'order',
                    where: { customer_id: customerId, orderstatus: '2' },
                    attributes: [] // Không cần lấy thông tin từ bảng Order
                },
                {
                    model: db.Product,
                    as: 'product',
                    attributes: ['name']
                },
                {
                    model: db.ColorProduct,
                    as: 'colorVariant',
                    attributes: ['name', 'image_urls']
                },
                {
                    model: db.SizeProduct,
                    as: 'sizeVariant',
                    attributes: ['name']
                }
            ],
            // Gộp các sản phẩm giống hệt nhau (cùng product, color, size)
            group: [
                'product.id',
                'product.name',
                'colorVariant.name',
                'colorVariant.image_urls',
                'sizeVariant.name',
                'image_url',
                'OrderDetail.price',  

            ],
            raw: true // Trả về kết quả dưới dạng object JSON thuần túy
        });
        console.log("purchasedItems", purchasedItems)
        // Chuyển đổi tên các trường để thân thiện hơn với frontend
        const result = purchasedItems.map(item => {
            let colorImageUrls = [];
            try {
                if (item['colorVariant.image_urls']) {
                    // Nếu DB trả về string thì parse JSON
                    colorImageUrls = typeof item['colorVariant.image_urls'] === 'string'
                        ? JSON.parse(item['colorVariant.image_urls'])
                        : item['colorVariant.image_urls'];
                }
            } catch (e) {
                console.error("Parse image_urls error:", e.message);
            }

            return {
                productId: item.productId,
                productName: item['product.name'],
                colorName: item['colorVariant.name'],
                sizeName: item['sizeVariant.name'],
                orderImageUrl: item.image_url, 
                colorImageUrl: colorImageUrls[0] || null,
                price: item.price,
            };
        });

        return result;

    } catch (error) {
        console.error("Get Purchased Products Service Error:", error.message);
        throw new Error('Lỗi khi lấy danh sách sản phẩm đã mua.');
    }
};

module.exports = {
    createOrder,
    getOrdersByCustomerId,
    getOrderById,
    getAllOrders,
    updateOrderStatus,         
    getAvailableOrderStatuses,
    removeItemsFromCart,
    createOrderForGuest,
    getPurchasedProductsByCustomerId
};

