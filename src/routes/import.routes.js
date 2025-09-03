'use strict';
const express = require('express');
const importController = require('../controllers/import.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

const canManageImports = authorizeRole("admin", "stock_manager");

router.post(
    '/',
    authenticateToken,
    canManageImports,
    importController.create
);

router.put(
    '/:id/complete',
    authenticateToken,
    canManageImports,
    importController.complete
);

router.get(
    '/',
    authenticateToken,
    canManageImports,
    importController.getAll
);

router.get(
    '/:id',
    authenticateToken,
    canManageImports,
    importController.getById
);

module.exports = router;