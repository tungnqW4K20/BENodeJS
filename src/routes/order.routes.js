

const express = require('express');
const orderController = require('../controllers/order.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware'); 

const router = express.Router();
router.patch('/:id/status',
    authenticateToken,
    orderController.updateOrderStatusCustomer
);

router.post('/', authenticateToken, orderController.create);

router.post('/guest', orderController.createGuestOrder);


router.get('/', authenticateToken, orderController.getMyOrders);
router.get('/customer', authenticateToken, orderController.getByCustomerId);
router.get('/my-purchased-products', authenticateToken, orderController.getMyPurchasedProducts);
router.get('/:id', authenticateToken, orderController.getMyOrderById);
router.get('/admin/all', authenticateToken, authorizeRole("admin"), orderController.getAllOrdersAdmin);


router.patch('/admin/orders/:id/status',
    authenticateToken,
    authorizeRole("admin"),
    orderController.updateOrderStatusAdmin
);

router.get('/admin/statuses',
    authenticateToken,
    authorizeRole("admin"),
    orderController.getOrderStatusesAdmin
);


module.exports = router;