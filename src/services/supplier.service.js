'use strict';

const db = require('../models'); 
const Supplier = db.Supplier;
const { Op } = db.Sequelize;

const createSupplier = async (supplierData) => {
    const { name, email, phonenumber } = supplierData;

    if (!name || !email || !phonenumber) {
        throw new Error('Tên, email, và số điện thoại của nhà cung cấp là bắt buộc.');
    }

    console.log("check 0: ", supplierData)

    const existingSupplierByEmail = await Supplier.findOne({
        where: {
            email: email,
        }
    });

    if (existingSupplierByEmail) {
        throw new Error(`Nhà cung cấp với email "${email}" đã tồn tại.`);
    }

    console.log("check 1: ", supplierData)

    const newSupplier = await Supplier.create({
        name,
        email,
        phonenumber
    });
    return newSupplier;
};

const getAllSuppliers = async () => {
    return await Supplier.findAll();
};


const getSupplierById = async (supplierId) => {
    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
        throw new Error(`Không tìm thấy nhà cung cấp với ID ${supplierId}.`);
    }
    return supplier;
};


const updateSupplier = async (supplierId, updateData) => {
    const { name, email, phonenumber } = updateData;

    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
        throw new Error(`Không tìm thấy nhà cung cấp với ID ${supplierId} để cập nhật.`);
    }

    if (email && email !== supplier.email) { 
        const existingSupplierWithNewEmail = await Supplier.findOne({
            where: {
                email: email,
                id: { [Op.ne]: supplierId } 
            }
        });

        if (existingSupplierWithNewEmail) {
            throw new Error(`Nhà cung cấp với email "${email}" đã tồn tại.`);
        }
    }

    
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (email !== undefined) fieldsToUpdate.email = email;
    if (phonenumber !== undefined) fieldsToUpdate.phonenumber = phonenumber;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
        throw new Error('Không có dữ liệu hợp lệ để cập nhật.');
    }

    await supplier.update(fieldsToUpdate);
    return supplier; 
};


const deleteSupplier = async (supplierId) => {
    const supplier = await Supplier.findByPk(supplierId);

    if (!supplier) {
        throw new Error(`Không tìm thấy nhà cung cấp với ID ${supplierId} để xóa.`);
    }

    await supplier.destroy();
};

module.exports = {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
};