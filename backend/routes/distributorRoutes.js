const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');

router.post('/login', distributorController.loginDistributor);

// Admin CRUD
router.get('/stats', distributorController.getAdminStats);
router.get('/', distributorController.getAllDistributors);
router.post('/', distributorController.createDistributor);
router.put('/:id', distributorController.updateDistributor);
router.delete('/:id', distributorController.deleteDistributor);

// Portal Specific
router.get('/:id/stats', distributorController.getDistributorStats);
router.get('/:id/dealers', distributorController.getDealers);
router.get('/dealers/:id', distributorController.getSingleDealer);
router.post('/dealers', distributorController.createDealer);
router.patch('/dealers/:id/status', distributorController.updateDealerStatus);
router.delete('/dealers/:id', distributorController.deleteDealer);
router.get('/:id/campaigns', distributorController.getCampaigns);
router.post('/campaigns', distributorController.createCampaign);
router.put('/campaigns/:id', distributorController.updateCampaign);
router.delete('/campaigns/:id', distributorController.deleteCampaign);
router.get('/:id/assets', distributorController.getAssets);
router.post('/assets', distributorController.createAsset);
router.delete('/assets/:id', distributorController.deleteAsset);
router.get('/:id/activity', distributorController.getActivity);
router.get('/:id/top-performers', distributorController.getTopPerformers);
router.get('/:id/zones', distributorController.getZones);
router.post('/zones', distributorController.createZone);
router.delete('/zones/:id', distributorController.deleteZone);
router.get('/:id/stockists', distributorController.getStockists);
router.post('/stockists', distributorController.createStockist);
router.get('/:id/bills', distributorController.getBills);
router.post('/bills', distributorController.createInvoice);
router.post('/orders', distributorController.createOrder);
router.get('/:id/stock-requests', distributorController.getStockRequests);
router.get('/stock-requests/:id/items', distributorController.getStockRequestItems);
router.patch('/stock-requests/:id/status', distributorController.updateStockRequestStatus);
router.post('/stock-requests', distributorController.createStockRequest);
router.post('/invoices', distributorController.createInvoice);

// Payment Gateway Routes for Stock Requests
router.post('/stock-requests/razorpay', distributorController.createStockRazorpayOrder);
router.post('/stock-requests/verify-payment', distributorController.verifyStockPayment);

module.exports = router;
