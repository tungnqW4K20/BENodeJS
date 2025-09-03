'use strict';

const db = require('../models');
const Category = db.Category;
const { Op } = db.Sequelize;

const createCategory = async (categoryData) => {
    const { name, image_url } = categoryData;

    if (!name) {
        throw new Error('Tên category là bắt buộc.');
    }

    const existingCategory = await Category.findOne({
        where: { name: name }
    });

    if (existingCategory) {
        throw new Error(`Category với tên "${name}" đã tồn tại.`);
    }

    const newCategory = await Category.create({ name, image_url: image_url || null });
    return newCategory;
};

const getAllCategories = async () => {
    return await Category.findAll();
};

const getCategoryById = async (categoryId) => {
    const category = await Category.findByPk(categoryId);
    if (!category) {
        throw new Error(`Không tìm thấy category với ID ${categoryId}.`);
    }
    return category;
};

const updateCategory = async (categoryId, updateData) => {
    const { name, image_url } = updateData;
    
    if (!name && image_url === undefined) {
        throw new Error('Cần cung cấp ít nhất một trường (name hoặc image_url) để cập nhật.');
    }

    const category = await Category.findByPk(categoryId);

    if (!category) {
        throw new Error(`Không tìm thấy category với ID ${categoryId} để cập nhật.`);
    }

    if (name) {
        const existingCategoryWithNewName = await Category.findOne({
            where: {
                name: name,
                id: { [Op.ne]: categoryId }
            }
        });

        if (existingCategoryWithNewName) {
            throw new Error(`Category với tên "${name}" đã tồn tại.`);
        }
    }

    const fieldsToUpdate = {};
    if (name) {
        fieldsToUpdate.name = name;
    }
    if (image_url !== undefined) {
        fieldsToUpdate.image_url = image_url;
    }

    await category.update(fieldsToUpdate);
    return category;
};

const deleteCategory = async (categoryId) => {
    const category = await Category.findByPk(categoryId);
    if (!category) {
        throw new Error(`Không tìm thấy category với ID ${categoryId} để xóa.`);
    }
    await category.destroy();
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};