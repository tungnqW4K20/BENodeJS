// src/services/inventoryService.js
'use strict';
const { Inventory, ColorProduct, SizeProduct } = require('../models');

/**
 * Lấy tất cả các mục tồn kho chi tiết cho một sản phẩm.
 * Kết quả trả về bao gồm thông tin về màu sắc và kích thước.
 * @param {number} productId ID của sản phẩm
 * @returns {Promise<Array>} Mảng các mục tồn kho
 */
const getInventoryForProduct = async (productId) => {
    const inventoryItems = await Inventory.findAll({
        include: [
            {
                model: ColorProduct,
                as: 'colorVariant',
                attributes: ['id', 'name'],
                where: { product_id: productId }, // Điều kiện lọc quan trọng
                required: true, // Đảm bảo chỉ lấy inventory của đúng sản phẩm (INNER JOIN)
            },
            {
                model: SizeProduct,
                as: 'sizeVariant',
                attributes: ['id', 'name'],
                required: true, // Đảm bảo chỉ lấy inventory của đúng sản phẩm (INNER JOIN)
            }
        ],
        attributes: ['id', 'quantity', 'color_product_id', 'size_product_id']
    });

    return inventoryItems;
};

/**
 * Cập nhật hoặc tạo mới (upsert) nhiều mục tồn kho cùng lúc.
 * @param {Array} inventoryData Mảng các đối tượng { color_product_id, size_product_id, quantity }
 * @returns {Promise<void>}
 */
const batchUpdateInventory = async (inventoryData) => {
    // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
    const t = await Inventory.sequelize.transaction();
    try {
        for (const item of inventoryData) {
            // Tìm hoặc tạo mới bản ghi với cặp color_product_id và size_product_id
            const [inventoryItem, created] = await Inventory.findOrCreate({
                where: {
                    color_product_id: item.color_product_id,
                    size_product_id: item.size_product_id,
                },
                defaults: { quantity: item.quantity },
                transaction: t,
            });

            // Nếu bản ghi đã tồn tại (không phải mới tạo), thì cập nhật số lượng
            if (!created) {
                await inventoryItem.update({ quantity: item.quantity }, { transaction: t });
            }
        }
        await t.commit();
    } catch (error) {
        await t.rollback();
        throw new Error('Lỗi khi cập nhật hàng loạt tồn kho: ' + error.message);
    }
};


module.exports = {
    getInventoryForProduct,
    batchUpdateInventory,
};