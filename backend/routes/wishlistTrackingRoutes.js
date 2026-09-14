const express = require('express');
const router = express.Router();
const wl = require('../controllers/wishlistTrackingController');

// Admin routes
router.get('/admin/all', wl.getAllWishlists);
router.get('/admin/stats', wl.getWishlistStats);

// Customer routes
router.get('/customer/:customerId', wl.getCustomerWishlist);
router.post('/', wl.addToWishlist);
router.delete('/:id', wl.removeFromWishlist);

module.exports = router;
