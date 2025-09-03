'use strict';

const db = require('../models'); // Adjust path if necessary
const Customer = db.Customer;
const { Op } = db.Sequelize;
const bcrypt = require('bcryptjs'); // For password hashing
const SALT_ROUNDS = 10;

/**
 * Helper function to exclude password from customer object.
 * @param {Customer} customer - Sequelize customer instance.
 * @returns {object} - Customer data without password.
 */
const customerToJSON = (customer) => {
    if (!customer) return null;
    const values = { ...customer.get({ plain: true }) };
    delete values.password;
    return values;
};


const createCustomer = async (customerData) => {
    const { name, email, address, username, password, phone } = customerData;

    if (!name || !email || !address || !phone) {
        throw new Error('Tên, email, địa chỉ và số điện thoại là bắt buộc.');
    }

    const existingEmail = await Customer.findOne({ where: { email } });
    if (existingEmail) {
        throw new Error(`Email "${email}" đã tồn tại.`);
    }

    const existingPhone = await Customer.findOne({ where: { phone } });
    if (existingPhone) {
        throw new Error(`Số điện thoại "${phone}" đã tồn tại.`);
    }

    if (username) {
        const existingUsername = await Customer.findOne({ where: { username } });
        if (existingUsername) {
            throw new Error(`Username "${username}" đã tồn tại.`);
        }
    }

    const customerToCreate = { name, email, address, username, phone };

    if (password) {
        customerToCreate.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const newCustomer = await Customer.create(customerToCreate);
    return customerToJSON(newCustomer);
};


/**
 * Get all customers (non-deleted).
 * @returns {Promise<object[]>} - List of customers (without passwords).
 */
const getAllCustomers = async () => {
    const customers = await Customer.findAll();
    return customers.map(customerToJSON);
};


const getCustomerById = async (customerId) => {
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
        throw new Error(`Không tìm thấy khách hàng với ID ${customerId}.`);
    }
    return customerToJSON(customer);
};


const updateCustomer = async (customerId, updateData) => {
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
        throw new Error(`Không tìm thấy khách hàng với ID ${customerId} để cập nhật.`);
    }

    const { name, email, address, username, password } = updateData;

    // Check for email conflict if email is being changed
    if (email && email !== customer.email) {
        const existingEmail = await Customer.findOne({
            where: {
                email,
                id: { [Op.ne]: customerId }
            }
        });
        if (existingEmail) {
            throw new Error(`Email "${email}" đã được sử dụng bởi khách hàng khác.`);
        }
    }

    // Check for username conflict if username is being changed
    if (username && username !== customer.username) {
        const existingUsername = await Customer.findOne({
            where: {
                username,
                id: { [Op.ne]: customerId }
            }
        });
        if (existingUsername) {
            throw new Error(`Username "${username}" đã được sử dụng bởi khách hàng khác.`);
        }
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (address !== undefined) dataToUpdate.address = address;
    if (username !== undefined) dataToUpdate.username = username; // Allows setting username to null if it was previously set
    
    if (password) { // Only update password if a new one is provided
        dataToUpdate.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    await customer.update(dataToUpdate);
    return customerToJSON(customer); // customer instance is updated in-place
};


const deleteCustomer = async (customerId) => {
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
        throw new Error(`Không tìm thấy khách hàng với ID ${customerId} để xóa.`);
    }
    await customer.destroy(); // Soft delete due to paranoid: true
};


const findCustomerByEmailForAuth = async (email) => {
    if (!email) return null;
    return await Customer.findOne({ where: { email } });
};


module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    findCustomerByEmailForAuth, // Exported for auth purposes
    customerToJSON // Export helper if needed elsewhere
};