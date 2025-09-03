'use strict';

const commentService = require('../services/comment.service');

/**
 * Lấy tất cả bình luận của một sản phẩm.
 */
const getByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (isNaN(parseInt(productId))) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ.' });
        }
        
        const comments = await commentService.getCommentsByProduct(productId);
        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error("Get Comments By Product Error:", error.message);
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};

/**
 * Khách hàng tạo bình luận mới.
 */
const createComment = async (req, res) => {
    try {
        // ID của khách hàng được lấy từ token sau khi xác thực
        const customerId = req.user.id; 
        const { content, product_id } = req.body;
        
        const newComment = await commentService.createCustomerComment({ content, product_id }, customerId);
        
        res.status(201).json({
            success: true,
            message: 'Bình luận đã được gửi thành công!',
            data: newComment
        });
    } catch (error) {
        console.error("Create Comment Error:", error.message);
        if (error.message.includes('bắt buộc') || error.message.includes('Không tìm thấy')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};

/**
 * Admin trả lời một bình luận.
 */
const createReply = async (req, res) => {
    try {
        const { parentId } = req.params; // ID của bình luận gốc
        const { content } = req.body;
        
        if (isNaN(parseInt(parentId))) {
            return res.status(400).json({ success: false, message: 'ID bình luận gốc không hợp lệ.' });
        }

        const newReply = await commentService.createAdminReply(parentId, { content });
        
        res.status(201).json({
            success: true,
            message: 'Đã trả lời bình luận thành công!',
            data: newReply
        });
    } catch (error) {
        console.error("Create Admin Reply Error:", error.message);
        if (error.message.includes('bắt buộc') || error.message.includes('Không tìm thấy')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};

/**
 * Cập nhật một bình luận.
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id; // Lấy ID từ token

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID bình luận không hợp lệ.' });
        }

        const updatedComment = await commentService.updateComment(id, { content }, userId);

        res.status(200).json({
            success: true,
            message: 'Cập nhật bình luận thành công!',
            data: updatedComment
        });
    } catch (error) {
        console.error("Update Comment Error:", error.message);
        if (error.message.includes('không có quyền')) {
            return res.status(403).json({ success: false, message: error.message }); // 403 Forbidden
        }
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};

/**
 * Xóa một bình luận.
 */
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user; // Lấy thông tin user { id, role } từ token

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ success: false, message: 'ID bình luận không hợp lệ.' });
        }

        await commentService.deleteComment(id, user);

        res.status(200).json({
            success: true,
            message: 'Xóa bình luận thành công!'
        });
    } catch (error) {
        console.error("Delete Comment Error:", error.message);
        if (error.message.includes('không có quyền')) {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message.includes('Không tìm thấy')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};


const getAll = async (req, res) => {
    try {
        const comments = await commentService.getAllComments();
        res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error("Get All Comments Error:", error.message);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
    }
};


module.exports = {
    getByProduct,
    createComment,
    createReply,
    update,
    deleteComment,
    getAll
};