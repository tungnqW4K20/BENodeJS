'use strict';

const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeRole("admin"),  categoryController.create);

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.put('/:id', authenticateToken, authorizeRole("admin"), categoryController.update);
router.delete('/:id', authenticateToken, authorizeRole("admin"), categoryController.deleteCategory);

module.exports = router;