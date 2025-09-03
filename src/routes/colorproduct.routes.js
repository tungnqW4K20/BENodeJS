'use strict';

const express = require('express');
const colorProductController = require('../controllers/colorproduct.controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); 

const router = express.Router();

router.post('/', authenticateToken, authorizeRole("admin"), colorProductController.create);

router.get('/product/:productId', colorProductController.getAllByProductId);

router.get('/:id', colorProductController.getById);

router.put('/:id', authenticateToken, authorizeRole("admin"), colorProductController.update);

router.delete('/:id', authenticateToken, authorizeRole("admin"), colorProductController.delete); 

router.patch('/:id/soft-delete', authenticateToken, authorizeRole("admin"), colorProductController.softDelete);

router.post('/:id/restore', authenticateToken, authorizeRole("admin"), colorProductController.restore);

module.exports = router;