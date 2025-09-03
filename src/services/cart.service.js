'use strict';

const db = require('../models');
const { Op } = db.Sequelize;
const CartItem = db.CartItem;
const Product = db.Product;
const ColorProduct = db.ColorProduct;
const SizeProduct = db.SizeProduct;


const addItemToCart = async (customerId, itemData) => {
    consele.log("1111111111111111111111111")
    const { product_id, color_product_id, size_product_id, quantity } = itemData;

    // 1. Validation (Giữ nguyên)
    if (!product_id || !color_product_id || !size_product_id || !quantity || quantity < 1) {
        throw new Error('Thông tin sản phẩm, biến thể và số lượng là bắt buộc.');
    }
    
    const productVariantExists = await Promise.all([
        Product.findByPk(product_id),
        ColorProduct.findByPk(color_product_id),
        SizeProduct.findByPk(size_product_id),
    ]);

    if (productVariantExists.some(item => !item)) {
        throw new Error('Sản phẩm hoặc biến thể được chọn không tồn tại.');
    }
    
    // 2. Tìm hoặc tạo CartItem (Logic gần như giữ nguyên)
    const existingItem = await CartItem.findOne({
        where: {
            customer_id: customerId,
            product_id: product_id,
            color_product_id: color_product_id,
            size_product_id: size_product_id,
        }
    });

    let savedItem; // Biến để lưu item đã được tạo hoặc cập nhật

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        savedItem = await existingItem.update({ quantity: newQuantity });
    } else {
        savedItem = await CartItem.create({
            customer_id: customerId,
            product_id,
            color_product_id,
            size_product_id,
            quantity
        });
    }

    // 3. *** THAY ĐỔI QUAN TRỌNG ***
    // Tìm lại item vừa lưu với đầy đủ thông tin chi tiết để trả về
    const itemWithDetails = await CartItem.findByPk(savedItem.id, {
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'image_url'] 
            },
            {
                model: ColorProduct,
                as: 'colorVariant',
                // Lấy các trường cần thiết, bao gồm cả image_urls
                attributes: ['id', 'name', 'price', 'colorCode', 'image_urls']
            },
            {
                model: SizeProduct,
                as: 'sizeVariant',
                attributes: ['id', 'name', 'price']
            }
        ]
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    return itemWithDetails;
};


const getCustomerCart = async (customerId) => {
    // Hàm này đã đúng, không cần thay đổi
    return await CartItem.findAll({
        where: { customer_id: customerId },
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'image_url'] 
            },
            {
                model: ColorProduct,
                as: 'colorVariant',
                attributes: ['id', 'name', 'price', 'colorCode', 'image_urls']
            },
            {
                model: SizeProduct,
                as: 'sizeVariant',
                attributes: ['id', 'name', 'price']
            }
        ]
    });
};


const updateCartItem = async (customerId, itemId, quantity) => {
    // Hàm này đã đúng, không cần thay đổi
    if (quantity < 1) {
        throw new Error('Số lượng phải lớn hơn hoặc bằng 1.');
    }

    const cartItem = await CartItem.findOne({
        where: {
            id: itemId,
            customer_id: customerId 
        }
    });

    if (!cartItem) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng.');
    }
    await cartItem.update({ quantity });
    await new Promise(resolve => setTimeout(resolve, 3000));
    return cartItem;
};



const removeCartItem = async (customerId, itemId) => {
    // Hàm này đã đúng, không cần thay đổi
    const cartItem = await CartItem.findOne({
        where: {
            id: itemId,
            customer_id: customerId 
        }
    });

    if (!cartItem) {
        throw new Error('Không tìm thấy sản phẩm trong giỏ hàng để xóa.');
    }

    await cartItem.destroy(); 
};

module.exports = {
    addItemToCart,
    getCustomerCart,
    updateCartItem,
    removeCartItem
};