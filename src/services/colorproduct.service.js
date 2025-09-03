'use strict';

const db = require('../models'); 

const ColorProduct = db.ColorProduct;
const { Inventory, sequelize } = db
const Product = db.Product;
const { Op } = db.Sequelize;


const createColorProduct = async (colorProductData) => {
    const { product_id, name, price, description, image_urls, colorCode } = colorProductData;

    if (!product_id || !name) {
        throw new Error('Product ID và Tên màu là bắt buộc.');
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm gốc với ID ${product_id}.`);
    }

    const existingVariant = await ColorProduct.findOne({
        where: {
            product_id: product_id,
            name: name
        }
    });
    if (existingVariant) {
        throw new Error(`Sản phẩm gốc ID ${product_id} đã có một biến thể màu tên là "${name}".`);
    }


    const newColorProduct = await ColorProduct.create({
        product_id,
        name,
        price,
        description,
        image_urls,
        colorCode 
    });
    return newColorProduct;
};


const getAllColorProductsByProductId = async (productId) => {
    const product = await Product.findByPk(productId);
    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm gốc với ID ${productId}.`);
    }

    return await ColorProduct.findAll({
        where: { product_id: productId },
        include: [{
            model: Inventory,
            as: 'inventoryEntries',
            attributes: [], // Không cần lấy các trường từ bảng Inventory
        }],
        attributes: {
            // Lấy tất cả các thuộc tính hiện có của ColorProduct
            include: [
                [
                    // Tính tổng số lượng từ các inventoryEntries liên quan
                    sequelize.fn('SUM', sequelize.col('inventoryEntries.quantity')),
                    'totalQuantity' // Đặt tên cho trường tổng số lượng là 'totalQuantity'
                ]
            ]
        },
        group: ['ColorProduct.id'] // Nhóm kết quả theo ID của ColorProduct để đảm bảo tính tổng chính xác
    });
};


const getColorProductById = async (colorProductId) => {
    const colorProduct = await ColorProduct.findByPk(colorProductId, {
        include: [
           { model: Product, as: 'product', attributes: ['id', 'name'] }
           
        ]
    });

    if (!colorProduct) {
        throw new Error(`Không tìm thấy biến thể màu sắc sản phẩm với ID ${colorProductId}.`);
    }
    return colorProduct;
};


const updateColorProduct = async (colorProductId, updateData) => {
    const colorProduct = await ColorProduct.findByPk(colorProductId);

    if (!colorProduct) {
        throw new Error(`Không tìm thấy biến thể màu sắc sản phẩm với ID ${colorProductId} để cập nhật.`);
    }

    const { name, price, description, image_urls, colorCode } = updateData;

    if (name && name !== colorProduct.name) {
        const existingVariantWithNewName = await ColorProduct.findOne({
            where: {
                product_id: colorProduct.product_id,
                name: name,
                id: { [Op.ne]: colorProductId }, 
            }
        });
        if (existingVariantWithNewName) {
            throw new Error(`Sản phẩm gốc ID ${colorProduct.product_id} đã có một biến thể màu khác tên là "${name}".`);
        }
    }

    if (name !== undefined) colorProduct.name = name;
    if (price !== undefined) colorProduct.price = price;
    if (description !== undefined) colorProduct.description = description;
    if (image_urls !== undefined) colorProduct.image_urls = image_urls;
    if ( colorCode !== undefined) colorProduct.colorCode = colorCode;

    await colorProduct.save();
    return colorProduct.reload({
        include: [
           { model: Product, as: 'product', attributes: ['id', 'name'] }
        ]
    });
};


const hardDeleteColorProduct = async (colorProductId) => {
    const colorProduct = await ColorProduct.findByPk(colorProductId, {
        paranoid: false 
    });

    if (!colorProduct) {
        throw new Error(`Không tìm thấy biến thể màu sắc sản phẩm với ID ${colorProductId} để xóa vĩnh viễn.`);
    }

    await colorProduct.destroy({ force: true });
};

const softDeleteColorProduct = async (colorProductId) => {
    const colorProduct = await ColorProduct.findByPk(colorProductId); // By default, finds non-deleted

    if (!colorProduct) {
        throw new Error(`Không tìm thấy biến thể màu sắc sản phẩm với ID ${colorProductId} để xóa mềm.`);
    }

    await colorProduct.destroy(); 
};


const restoreColorProduct = async (colorProductId) => {
    const colorProduct = await ColorProduct.findByPk(colorProductId, {
        paranoid: false 
    });

    if (!colorProduct) {
        throw new Error(`Không tìm thấy biến thể màu sắc sản phẩm với ID ${colorProductId} (kể cả đã xóa mềm) để khôi phục.`);
    }

    if (!colorProduct.deletedAt) {
        throw new Error(`Biến thể màu sắc sản phẩm với ID ${colorProductId} chưa bị xóa mềm.`);
    }

    await colorProduct.restore();
    return colorProduct;
};

/**
 * Gets all color product variants, including soft-deleted ones (for admin views, etc.).
 * @param {number} productId - The ID of the parent product.
 * @returns {Promise<ColorProduct[]>} - List of color product variants.
 */
const getAllColorProductsIncludingDeleted = async (productId) => {
    const product = await Product.findByPk(productId);
    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm gốc với ID ${productId}.`);
    }

    return await ColorProduct.findAll({
        where: { product_id: productId },
        paranoid: false // Include soft-deleted items
    });
};

module.exports = {
    createColorProduct,
    getAllColorProductsByProductId,
    getColorProductById,
    updateColorProduct,
    hardDeleteColorProduct,
    softDeleteColorProduct,
    restoreColorProduct,
    getAllColorProductsIncludingDeleted
};