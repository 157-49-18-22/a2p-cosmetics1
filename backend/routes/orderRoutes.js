const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/create', orderController.createOrder);
router.post('/razorpay', orderController.createRazorpayOrder);
router.get('/all', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
