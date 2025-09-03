'use strict';

const productService = require('../services/product.service'); 

const create = async (req, res, next) => {
    try {
        const { name, description, price, image_url, category_id } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu trường bắt buộc: name và description.'
            });
        }

        const productData = { name, description, price, image_url, category_id };
        const newProduct = await productService.createProduct(productData);

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công!',
            data: newProduct
        });
    } catch (error) {
        console.error("Create Product Error:", error.message);
        if (error.message.includes('bắt buộc') || error.message.includes('Lỗi validation')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('Không tìm thấy danh mục')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã tồn tại')) { 
            return res.status(409).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi tạo sản phẩm.' });
    }
};


const getAll = async (req, res, next) => {
    try {
        const { limit = 10, page = 1, categoryId, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        const queryParams = { limit: parseInt(limit), offset, categoryId, search };

        const { rows: products, count } = await productService.getAllProducts(queryParams);
        
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / parseInt(limit)),
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Get All Products Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách sản phẩm.' });
    }
};


const getById = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        const product = await productService.getProductById(productId);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error("Get Product By ID Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy thông tin sản phẩm.' });
    }
};


const update = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

       
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có dữ liệu nào được cung cấp để cập nhật.'
            });
        }
        
        const updatedProduct = await productService.updateProduct(productId, req.body);

        res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công!',
            data: updatedProduct
        });
    } catch (error) {
        console.error("Update Product Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('bắt buộc') || error.message.includes('Lỗi validation')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        if (error.message.includes('đã tồn tại')) { 
            return res.status(409).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi cập nhật sản phẩm.' });
    }
};

const deleteProductController = async (req, res, next) => { 
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        await productService.deleteProduct(productId);

        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm thành công!'
        });
    } catch (error) {
        console.error("Delete Product Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi xóa sản phẩm.' });
    }
};

const getPaginateFeature = async (req, res, next) => {
    try {
        const { limit = 10, page = 1, categoryId, search } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let isFeatured = true;
        
        const queryParams = { limit: parseInt(limit), offset, categoryId, search, isFeatured };

        const { rows: products, count } = await productService.getAllProducts(queryParams);
        
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / parseInt(limit)),
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Get All Products Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy danh sách sản phẩm.' });
    }
};



const getVariants = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        const variants = await productService.getProductVariantsById(productId);
        
        res.status(200).json({
            success: true,
            data: variants
        });
    } catch (error) {
        console.error("Get Product Variants Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy các biến thể của sản phẩm.' });
    }
};


const getDetailsById = async (req, res, next) => {
    try {
        const productId = req.params.id;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }

        const productDetails = await productService.getFullProductDetailsById(productId);
        
        res.status(200).json({
            success: true,
            data: productDetails
        });
    } catch (error) {
        console.error("Get Product Details Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy chi tiết sản phẩm.' });
    }
};


const getByCategory = async (req, res, next) => {
    try {
        // Lấy categoryId từ path parameters
        const { categoryId } = req.params;
        // Lấy tham số phân trang từ query string
        const { limit = 10, page = 1 } = req.query;

        // Kiểm tra ID danh mục có hợp lệ không
        if (isNaN(parseInt(categoryId))) {
            return res.status(400).json({ success: false, message: 'ID danh mục không hợp lệ.' });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        
        const queryParams = { 
            limit: parseInt(limit), 
            offset, 
            categoryId: parseInt(categoryId) 
        };

        const { rows: products, count } = await productService.getAllProducts(queryParams);
        
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / parseInt(limit)),
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Get Products By Category Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ khi lấy sản phẩm theo danh mục.' });
    }
};




module.exports = {
    create,
    getAll,
    getById,
    update,
    deleteProduct: deleteProductController ,
    getPaginateFeature,
    getVariants,
    getDetailsById,
    getByCategory
};