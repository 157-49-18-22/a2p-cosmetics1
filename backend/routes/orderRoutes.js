const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.post('/create', verifyToken, orderController.createOrder);
router.post('/razorpay', orderController.createRazorpayOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/all', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', verifyToken, orderController.cancelOrder);
router.patch('/:id/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;
