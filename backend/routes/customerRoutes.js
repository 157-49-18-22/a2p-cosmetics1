const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getCustomers);
router.post('/', customerController.addCustomer);

// Auth Routes
router.post('/signup', customerController.signupCustomer);
router.post('/login', customerController.loginCustomer);
router.put('/:id/notes', customerController.updateNotes);
router.delete('/:id', customerController.deleteCustomer);
router.get('/activity', customerController.getCustomerActivity);

// Address Routes
router.get('/addresses', customerController.getAddresses);
router.post('/addresses', customerController.addAddress);
router.put('/addresses/:id', customerController.updateAddress);
router.delete('/addresses/:id', customerController.deleteAddress);


module.exports = router;
