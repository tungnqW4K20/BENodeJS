'use strict';

const db = require('../models');
const { Comment, Customer, Product } = db;


const getCommentsByProduct = async (productId) => {
    const productExists = await Product.findByPk(productId);
    if (!productExists) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${productId}.`);
    }

    const comments = await Comment.findAll({
        where: {
            product_id: productId,
            parent_id: null 
        },
        include: [
            {
                model: Customer,
                as: 'customer', // Lấy thông tin người bình luận (khách hàng)
                attributes: ['id', 'name'] // Chỉ lấy các trường cần thiết
            },
            {
                model: Comment,
                as: 'Replies', // Lấy các câu trả lời cho bình luận này
                include: [
                    {
                        // Lấy thông tin người trả lời (có thể là khách hàng khác hoặc admin)
                        // Nếu là admin trả lời, customer sẽ là null
                        model: Customer,
                        as: 'customer',
                        attributes: ['id', 'name']
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']] // Sắp xếp bình luận mới nhất lên đầu
    });

    return comments;
};




const getAllComments = async () => {
    const comments = await Comment.findAll({
        include: [
            {
                model: Customer,
                as: 'customer', 
                attributes: ['id', 'name']
            },
            {
                model: Product,
                as: 'product', 
                attributes: ['id', 'name']
            }
        ],
        order: [['createdAt', 'DESC']] 
    });
    return comments;
};



const createCustomerComment = async (commentData, customerId) => {
    const { content, product_id } = commentData;
    if (!content || !product_id) {
        throw new Error('Nội dung và ID sản phẩm là bắt buộc.');
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
        throw new Error(`Không tìm thấy sản phẩm với ID ${product_id}.`);
    }
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
        throw new Error(`Không tìm thấy khách hàng với ID ${customerId}.`);
    }

    const newComment = await Comment.create({
        content,
        product_id,
        customer_id: customerId,
        parent_id: null // Đây là bình luận gốc
    });

    return newComment;
};


const createAdminReply = async (parentId, replyData) => {
    const { content } = replyData;
    if (!content) {
        throw new Error('Nội dung trả lời là bắt buộc.');
    }

    const parentComment = await Comment.findByPk(parentId);
    if (!parentComment) {
        throw new Error(`Không tìm thấy bình luận gốc với ID ${parentId}.`);
    }

    // Admin trả lời, vì vậy customer_id sẽ là null.
    // Câu trả lời phải thuộc cùng một sản phẩm với bình luận gốc.
    const newReply = await Comment.create({
        content,
        product_id: parentComment.product_id,
        parent_id: parentId,
        customer_id: null // Admin không phải là customer
    });

    return newReply;
};



const updateComment = async (commentId, updateData, userId) => {
    const { content } = updateData;
    if (!content) {
        throw new Error('Nội dung là bắt buộc để cập nhật.');
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
        throw new Error(`Không tìm thấy bình luận với ID ${commentId}.`);
    }

    if (comment.customer_id !== userId) {
        throw new Error('Bạn không có quyền chỉnh sửa bình luận này.');
    }

    await comment.update({ content });
    return comment;
};


const deleteComment = async (commentId, user) => {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
        throw new Error(`Không tìm thấy bình luận với ID ${commentId} để xóa.`);
    }

    const isOwner = comment.customer_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
        throw new Error('Bạn không có quyền xóa bình luận này.');
    }

    await comment.destroy(); 
};

module.exports = {
    getCommentsByProduct,
    createCustomerComment,
    createAdminReply,
    updateComment,
    deleteComment,
    getAllComments
};