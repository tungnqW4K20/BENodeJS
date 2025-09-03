'use strict';

const express = require('express');
const cartController = require('../controllers/cart.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticateToken, cartController.getCart);

router.post('/', authenticateToken, cartController.addItem);

router.put('/:itemId', authenticateToken, cartController.updateItem);

router.delete('/:itemId', authenticateToken, cartController.removeItem);


module.exports = router;