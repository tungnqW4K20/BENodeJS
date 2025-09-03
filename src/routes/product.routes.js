'use strict';

const express = require('express');
const productController = require('../controllers/product.controller'); 
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); 

const router = express.Router();

router.post('/', authenticateToken, authorizeRole("admin"), productController.create);

router.get('/', productController.getAll);

router.get('/get-paginate-featured', productController.getPaginateFeature);

router.get('/:id', productController.getById);

router.put('/:id', authenticateToken, authorizeRole("admin"), productController.update);

router.delete('/:id', authenticateToken, authorizeRole("admin"), productController.deleteProduct);

router.get('/:id/variants', productController.getVariants);

router.get('/:id/details', productController.getDetailsById);

router.get('/category/:categoryId', productController.getByCategory);

module.exports = router;