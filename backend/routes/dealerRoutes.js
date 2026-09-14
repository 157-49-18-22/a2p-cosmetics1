const express = require('express');
const router = express.Router();
const dealerController = require('../controllers/dealerController');

// Dealer Login
router.post('/login', dealerController.loginDealer);

// Dealer CRUD (if needed)
router.get('/', dealerController.getAllDealers);
router.get('/:id', dealerController.getDealerById);
router.put('/:id', dealerController.updateDealer);
router.delete('/:id', dealerController.deleteDealer);

// Dealer Orders
router.post('/orders', dealerController.createOrder);
router.get('/:id/orders', dealerController.getMyOrders);
router.get('/orders-details/:orderId', dealerController.getOrderDetails);
router.get('/:id/allocations', dealerController.getDealerAllocations);

module.exports = router;
