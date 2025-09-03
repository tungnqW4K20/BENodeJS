'use strict';

const express = require('express');
const supplierController = require('../controllers/supplier.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); 

const router = express.Router();

router.post('/', authenticateToken, authorizeRole('admin'), supplierController.create);

router.get('/', authenticateToken, authorizeRole('admin'), supplierController.getAll);

router.get('/:id', authenticateToken, authorizeRole('admin'), supplierController.getById);

router.put('/:id', authenticateToken, authorizeRole('admin'), supplierController.update);

router.delete('/:id', authenticateToken, authorizeRole('admin'), supplierController.deleteSupplier);

module.exports = router;