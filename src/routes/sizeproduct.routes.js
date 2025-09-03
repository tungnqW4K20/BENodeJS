'use strict';

const express = require('express');
const sizeProductController = require('../controllers/sizeproduct.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/size-products - Create a new size product variant (Admin only)
// Expects product_id in req.body
router.post('/', authenticateToken, authorizeRole("admin"), sizeProductController.create);

// GET /api/size-products/product/:productId - Get all (non-deleted) size variants for a product (Public)
router.get('/product/:productId', sizeProductController.getAllByProductId);

// GET /api/size-products/product/:productId/all - Get all (including deleted) size variants for a product (Admin only)
router.get('/product/:productId/all', authenticateToken, authorizeRole("admin"), sizeProductController.getAllIncludingDeleted);

// GET /api/size-products/:id - Get a specific (non-deleted) size variant by its ID (Public)
router.get('/:id', sizeProductController.getById);

// PUT /api/size-products/:id - Update a specific size variant by its ID (Admin only)
router.put('/:id', authenticateToken, authorizeRole("admin"), sizeProductController.update);

// DELETE /api/size-products/:id - Permanently delete a specific size variant (Admin only)
router.delete('/:id', authenticateToken, authorizeRole("admin"), sizeProductController.delete);

// PATCH /api/size-products/:id/soft-delete - Soft delete a specific size variant (Admin only)
router.patch('/:id/soft-delete', authenticateToken, authorizeRole("admin"), sizeProductController.softDelete);

// POST /api/size-products/:id/restore - Restore a soft-deleted size variant (Admin only)
router.post('/:id/restore', authenticateToken, authorizeRole("admin"), sizeProductController.restore);

module.exports = router;