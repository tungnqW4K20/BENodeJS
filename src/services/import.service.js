'use strict';
const db = require('../models');
const { Op } = require('sequelize');

const createImportInvoice = async (invoiceData) => {
    const { supliers_id, details } = invoiceData;

    if (!supliers_id) {
        throw new Error('ID nhà cung cấp là bắt buộc.');
    }
    if (!details || !Array.isArray(details) || details.length === 0) {
        throw new Error('Chi tiết hóa đơn (details) là bắt buộc và phải là một mảng không rỗng.');
    }

    const supplier = await db.Supplier.findByPk(supliers_id);
    if (!supplier) {
        throw new Error(`Không tìm thấy nhà cung cấp với ID ${supliers_id}.`);
    }

    const transaction = await db.sequelize.transaction();
    try {
        const invoiceDetailsData = [];
        for (const detail of details) {
            if (!detail.color_product_id || !detail.size_product_id || !detail.quantity || !detail.price) {
                throw new Error('Mỗi chi tiết sản phẩm phải có color_product_id, size_product_id, quantity, và price.');
            }
            if (detail.quantity <= 0) {
                throw new Error('Số lượng sản phẩm nhập phải lớn hơn 0.');
            }

            const colorVariant = await db.ColorProduct.findByPk(detail.color_product_id, { transaction });
            const sizeVariant = await db.SizeProduct.findByPk(detail.size_product_id, { transaction });

            if (!colorVariant || !sizeVariant) {
                throw new Error(`Không tìm thấy biến thể sản phẩm cho color_id ${detail.color_product_id} hoặc size_id ${detail.size_product_id}.`);
            }
            if (colorVariant.product_id !== sizeVariant.product_id) {
                throw new Error(`Biến thể màu (ID: ${colorVariant.id}) và size (ID: ${sizeVariant.id}) không thuộc cùng một sản phẩm.`);
            }

            invoiceDetailsData.push({
                products_id: colorVariant.product_id,
                color_product_id: detail.color_product_id,
                size_product_id: detail.size_product_id,
                quantity: detail.quantity,
                price: detail.price
            });
        }

        const newInvoice = await db.ImportInvoice.create({
            supliers_id,
            import_status: '0',
            import_date: new Date()
        }, { transaction });

        const finalDetails = invoiceDetailsData.map(detail => ({
            ...detail,
            import_invoices_id: newInvoice.id,
        }));

        await db.ImportInvoiceDetail.bulkCreate(finalDetails, { transaction });

        await transaction.commit();

        return await db.ImportInvoice.findByPk(newInvoice.id, {
            include: [{ model: db.ImportInvoiceDetail, as: 'details' }]
        });

    } catch (error) {
        await transaction.rollback();
        throw new Error(`Tạo hóa đơn thất bại: ${error.message}`);
    }
};

const completeImportAndUpdateInventory = async (invoiceId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const invoice = await db.ImportInvoice.findByPk(invoiceId, {
            include: [{
                model: db.ImportInvoiceDetail,
                as: 'details'
            }],
            transaction
        });

        if (!invoice) {
            throw new Error(`Không tìm thấy hóa đơn nhập hàng với ID ${invoiceId}.`);
        }
        if (invoice.import_status !== '0') {
            throw new Error('Hóa đơn này đã được xử lý hoặc đang ở trạng thái không hợp lệ.');
        }

        for (const detail of invoice.details) {
            const { color_product_id, size_product_id, quantity } = detail;

            const [inventoryItem] = await db.Inventory.findOrCreate({
                where: {
                    color_product_id: color_product_id,
                    size_product_id: size_product_id
                },
                defaults: {
                    quantity: 0
                },
                transaction
            });

            await inventoryItem.increment('quantity', { by: quantity, transaction });
        }

        invoice.import_status = '2';
        await invoice.save({ transaction });

        await transaction.commit();

        return invoice;

    } catch (error) {
        await transaction.rollback();
        throw new Error(`Hoàn thành hóa đơn thất bại: ${error.message}`);
    }
};

const getAllImportInvoices = async (options = {}) => {
    const { limit = 10, page = 1 } = options;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.ImportInvoice.findAndCountAll({
        include: [
            {
                model: db.Supplier,
                as: 'supplier',
                attributes: ['id', 'name', 'email']
            },
            {
                model: db.ImportInvoiceDetail,
                as: 'details',
                attributes: ['price', 'quantity']
            }
        ],
        limit,
        offset,
        order: [['import_date', 'DESC']],
        distinct: true
    });

    const invoicesWithTotal = rows.map(invoice => {
        const invoiceData = invoice.get({ plain: true });
        const totalAmount = invoiceData.details.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 0;
            return sum + (price * quantity);
        }, 0);

        invoiceData.total_amount = totalAmount;
        delete invoiceData.details;

        return invoiceData;
    });

    return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        invoices: invoicesWithTotal
    };
};

const getImportInvoiceById = async (invoiceId) => {
    const invoice = await db.ImportInvoice.findByPk(invoiceId, {
        include: [
            {
                model: db.Supplier,
                as: 'supplier'
            },
            {
                model: db.ImportInvoiceDetail,
                as: 'details',
                include: [
                    { model: db.Product, paranoid: false, attributes: ['id', 'name', 'image_url'] },
                    { model: db.ColorProduct, paranoid: false, attributes: ['id', 'name'] },
                    { model: db.SizeProduct, paranoid: false, attributes: ['id', 'name'] }
                ]
            }
        ]
    });

    if (!invoice) {
        throw new Error(`Không tìm thấy hóa đơn nhập hàng với ID ${invoiceId}.`);
    }

    const invoiceData = invoice.get({ plain: true });
    const totalAmount = invoiceData.details.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity, 10) || 0;
        return sum + (price * quantity);
    }, 0);
    invoiceData.total_amount = totalAmount;

    return invoiceData;
};

module.exports = {
    createImportInvoice,
    completeImportAndUpdateInventory,
    getAllImportInvoices,
    getImportInvoiceById
};