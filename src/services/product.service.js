// src/services/product.service.js
'use strict';

const db = require('../models'); // Adjust path if necessary
const Product = db.Product;
const Category = db.Category; // For eager loading and validation
const ColorProduct = db.ColorProduct;
const SizeProduct = db.SizeProduct;
const { Op } = db.Sequelize;

/**
 * Create a new product.
 * @param {object} productData - Data for the new product.
 * @returns {Promise<Product>} - The created product.
 * @throws {Error} - If validation fails or category not found.
 */
const createProduct = async (productData) => {
    const { name, description, price, image_url, category_id } = productData;

    if (!name || !description) {
        throw new Error('Tên sản phẩm và mô tả là bắt buộc.');
    }

    if (category_id) {
        const category = await Category.findByPk(category_id);
        if (!category) {
            throw new Error(`Không tìm thấy danh mục với ID ${category_id}.`);
        }
    }
    
   

    try {
        const newProduct = await Product.create({
            name,
            description,
            price, 
            image_url, 
            category_id 
        });
        return await Product.findByPk(newProduct.id, {
            include: [{ model: Category, as: 'category' }]
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Lỗi validation: ${messages}`);
        }
        throw error; 
    }
};

const getAllProducts = async (queryParams = {}) => {
    let { limit, offset, categoryId, search, isFeatured } = queryParams;

    if(!isFeatured) {
        isFeatured = false;
    }

    const options = {
        include: [{
            model: Category,
            as: 'category',
            attributes: ['id', 'name'] 
        }],
        where: {},
        order: [['createdAt', 'DESC']], 
    };

    if (isFeatured === 'true' || isFeatured === true) {
        options.where.featured = true;
    }

    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    if (categoryId) {
        options.where.category_id = categoryId;
    }

    if (search) {
        options.where.name = { [Op.iLike]: `%${search}%` }; 
    }

    

    return await Product.findAndCountAll(options);
};


const getProductById = async (productId) => {
    const product = await Product.findByPk(productId, {
        include: [
            { model: Category, as: 'category', attributes: ['id', 'name'] },
        ]
    });

    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${productId}.`);
    }
    return product;
};


const updateProduct = async (productId, updateData) => {
    const product = await Product.findByPk(productId);

    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${productId} để cập nhật.`);
    }

    const { name, description, price, image_url, category_id } = updateData;

    if (category_id !== undefined) { 
        if (category_id === null) { 
            product.category_id = null;
        } else {
            const category = await Category.findByPk(category_id);
            if (!category) {
                throw new Error(`Không tìm thấy danh mục với ID ${category_id}.`);
            }
            product.category_id = category_id;
        }
    }
    
    
    
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price; 
    if (image_url !== undefined) product.image_url = image_url; 

    try {
        await product.save(); 
        return await Product.findByPk(product.id, {
            include: [{ model: Category, as: 'category' }]
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(e => e.message).join(', ');
            throw new Error(`Lỗi validation: ${messages}`);
        }
        throw error; 
    }
};


const deleteProduct = async (productId) => {
    const product = await Product.findByPk(productId);

    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${productId} để xóa.`);
    }

    await product.destroy(); 
};



const getProductVariantsById = async (productId) => {
    // 1. Kiểm tra xem sản phẩm có tồn tại không
    const productExists = await Product.findByPk(productId, { attributes: ['id'] });
    if (!productExists) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${productId}.`);
    }

    // 2. Lấy đồng thời cả danh sách màu và size thuộc về sản phẩm đó
    const [colors, sizes] = await Promise.all([
        ColorProduct.findAll({
            where: { product_id: productId },
            attributes: ['id', 'name', 'price', 'image_urls'], // Chỉ lấy các trường cần thiết
            order: [['createdAt', 'ASC']]
        }),
        SizeProduct.findAll({
            where: { product_id: productId },
            attributes: ['id', 'name', 'price'], // Chỉ lấy các trường cần thiết
            order: [['createdAt', 'ASC']]
        })
    ]);

    // 3. Trả về kết quả
    return {
        colors,
        sizes
    };
};


const getFullProductDetailsById = async (productId) => {
    const product = await Product.findByPk(productId, {
        // Sử dụng "include" để lấy dữ liệu từ các bảng liên quan
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name'] // Chỉ lấy các trường cần thiết của Category
            },
            {
                model: ColorProduct,
                as: 'colorOptions', // Phải khớp với alias trong model Product
                attributes: ['id', 'name', 'price', 'image_urls' , 'colorCode' ], // Lấy các trường cần thiết, bao gồm cả ảnh của màu
                order: [['createdAt', 'ASC']],
            },
            {
                model: SizeProduct,
                as: 'sizeOptions', // Phải khớp với alias trong model Product
                attributes: ['id', 'name', 'price'], // Lấy các trường cần thiết của Size
                order: [['createdAt', 'ASC']],
            }
        ],
        // Loại bỏ các trường không cần thiết từ model Product chính
        attributes: {
            exclude: ['updatedAt', 'deletedAt']
        }
    });

    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${productId}.`);
    }

    return product;
};



module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductVariantsById,
    getFullProductDetailsById
};