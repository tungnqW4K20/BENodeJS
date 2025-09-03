'use strict';

const db = require('../models'); 
const SizeProduct = db.SizeProduct;
const Product = db.Product;
const { Inventory, sequelize } = db
const { Op } = db.Sequelize;



const createSizeProduct = async (sizeProductData) => {
    const { product_id, name, price, description } = sizeProductData;

    if (!product_id || !name) {
        throw new Error('Product ID và Tên kích thước là bắt buộc.');
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm gốc với ID ${product_id}.`);
    }

    const existingVariant = await SizeProduct.findOne({
        where: {
            product_id: product_id,
            name: name,
            deletedAt: null 
        }
    });
    if (existingVariant) {
        throw new Error(`Sản phẩm gốc ID ${product_id} đã có một biến thể kích thước tên là "${name}".`);
    }

    const newSizeProduct = await SizeProduct.create({
        product_id,
        name,
        price,
        description
    });
    return newSizeProduct;
};


const getAllSizeProductsByProductId = async (productId) => {
    // 1. Kiểm tra xem sản phẩm gốc có tồn tại không
    const product = await Product.findByPk(productId);
    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm gốc với ID ${productId}.`);
    }

    // 2. Tìm tất cả các biến thể kích thước của sản phẩm và tính tổng số lượng
    return await SizeProduct.findAll({
        where: { product_id: productId },
        include: [{
            model: Inventory,
            as: 'inventoryEntries', // Sử dụng alias đã định nghĩa trong model SizeProduct
            attributes: [], // Không cần lấy bất kỳ trường nào từ bảng Inventory
        }],
        attributes: {
            // Bao gồm tất cả các thuộc tính gốc của SizeProduct
            include: [
                [
                    // Sử dụng hàm SUM của sequelize để tính tổng cột 'quantity'
                    sequelize.fn('SUM', sequelize.col('inventoryEntries.quantity')),
                    'totalQuantity' // Đặt tên cho trường mới là 'totalQuantity'
                ]
            ]
        },
        group: ['SizeProduct.id'] // Nhóm kết quả theo ID để SUM được tính cho mỗi kích thước
    });
};


const getSizeProductById = async (sizeProductId) => {
    const sizeProduct = await SizeProduct.findByPk(sizeProductId, {
        include: [
           { model: Product, as: 'product', attributes: ['id', 'name'] }
        ]
    });

    if (!sizeProduct) {
        throw new Error(`Không tìm thấy biến thể kích thước sản phẩm với ID ${sizeProductId}.`);
    }
    return sizeProduct;
};


const updateSizeProduct = async (sizeProductId, updateData) => {
    const sizeProduct = await SizeProduct.findByPk(sizeProductId); 

    if (!sizeProduct) {
        throw new Error(`Không tìm thấy biến thể kích thước sản phẩm với ID ${sizeProductId} để cập nhật.`);
    }

    const { name, price, description } = updateData;

    if (name && name !== sizeProduct.name) {
        const existingVariantWithNewName = await SizeProduct.findOne({
            where: {
                product_id: sizeProduct.product_id,
                name: name,
                id: { [Op.ne]: sizeProductId },
                deletedAt: null 
            }
        });
        if (existingVariantWithNewName) {
            throw new Error(`Sản phẩm gốc ID ${sizeProduct.product_id} đã có một biến thể kích thước khác tên là "${name}".`);
        }
    }

    if (name !== undefined) sizeProduct.name = name;
    if (price !== undefined) sizeProduct.price = price;
    if (description !== undefined) sizeProduct.description = description;

    await sizeProduct.save();
    return sizeProduct.reload({
        include: [
           { model: Product, as: 'product', attributes: ['id', 'name'] }
        ]
    });
};


const hardDeleteSizeProduct = async (sizeProductId) => {
    const sizeProduct = await SizeProduct.findByPk(sizeProductId, {
        paranoid: false 
    });

    if (!sizeProduct) {
        throw new Error(`Không tìm thấy biến thể kích thước sản phẩm với ID ${sizeProductId} để xóa vĩnh viễn.`);
    }
    await sizeProduct.destroy({ force: true });
};


const softDeleteSizeProduct = async (sizeProductId) => {
    const sizeProduct = await SizeProduct.findByPk(sizeProductId);

    if (!sizeProduct) {
        throw new Error(`Không tìm thấy biến thể kích thước sản phẩm với ID ${sizeProductId} để xóa mềm.`);
    }
    await sizeProduct.destroy(); 
};


const restoreSizeProduct = async (sizeProductId) => {
    const sizeProduct = await SizeProduct.findByPk(sizeProductId, {
        paranoid: false
    });

    if (!sizeProduct) {
        throw new Error(`Không tìm thấy biến thể kích thước sản phẩm với ID ${sizeProductId} (kể cả đã xóa mềm) để khôi phục.`);
    }

    if (!sizeProduct.deletedAt) {
        throw new Error(`Biến thể kích thước sản phẩm với ID ${sizeProductId} chưa bị xóa mềm.`);
    }
    await sizeProduct.restore();
    return sizeProduct;
};


const getAllSizeProductsIncludingDeleted = async (productId) => {
    const product = await Product.findByPk(productId);
    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm gốc với ID ${productId}.`);
    }
    return await SizeProduct.findAll({
        where: { product_id: productId },
        paranoid: false 
    });
};

module.exports = {
    createSizeProduct,
    getAllSizeProductsByProductId,
    getSizeProductById,
    updateSizeProduct,
    hardDeleteSizeProduct,
    softDeleteSizeProduct,
    restoreSizeProduct,
    getAllSizeProductsIncludingDeleted
};