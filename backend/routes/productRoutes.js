const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/recommendations', productController.getRecommendations);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/like', productController.likeProduct);

// Pincode Availability Check
router.get('/:id/check-pincode', productController.checkPincodeAvailability);

// Review System Routes
router.get('/:productId/reviews', productController.getProductReviews);
router.post('/:productId/reviews', productController.createProductReview);
router.put('/:productId/reviews/:reviewId/helpful', productController.markReviewHelpful);

module.exports = router;



