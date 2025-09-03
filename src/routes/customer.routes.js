'use strict';

const express = require('express');
const customerController = require('../controllers/customer.controller'); // Adjust path if necessary
const { authenticateToken, authorizeRole, authorizeCustomerOrAdmin } = require('../middlewares/auth.middleware'); // Assuming these exist

const router = express.Router();

// --- Public Route ---
// POST /api/customers - Register a new customer
router.post('/', customerController.create);

// --- Admin Only Routes ---
// GET /api/customers - Get all customers (Admin only)
router.get('/',  customerController.getAll);


router.get('/:id', customerController.getById); // Simplified: Admin only

// PUT /api/customers/:id - Update a customer
// router.put('/:id', authenticateToken, authorizeCustomerOrAdmin, customerController.update); // Ideal
router.put('/:id',authenticateToken, customerController.update); // Simplified: Admin only

// DELETE /api/customers/:id - Delete a customer
// router.delete('/:id', authenticateToken, authorizeCustomerOrAdmin, customerController.deleteCtrl); // Ideal
router.delete('/:id', authenticateToken, authorizeRole("admin"), customerController.deleteCtrl); // Simplified: Admin only

module.exports = router;