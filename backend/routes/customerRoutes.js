const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'a2p_super_secret_key_2024';

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.a2p_token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    req.user = null;
    next();
  }
};

router.get('/', customerController.getCustomers);
router.post('/', customerController.addCustomer);

// Auth Routes
router.post('/send-otp', customerController.sendSignupOtp);
router.post('/verify-otp-signup', customerController.verifyOtpAndSignup);
router.post('/signup', customerController.signupCustomer);
router.post('/login', customerController.loginCustomer);
router.put('/:id/notes', customerController.updateNotes);
router.delete('/:id', customerController.deleteCustomer);
router.get('/activity', customerController.getCustomerActivity);
router.post('/activity/track', optionalAuth, customerController.trackActivity);

// Address Routes
const { verifyToken } = require('../middleware/auth');
router.get('/addresses', verifyToken, customerController.getAddresses);
router.post('/addresses', verifyToken, customerController.addAddress);
router.put('/addresses/:id', verifyToken, customerController.updateAddress);
router.delete('/addresses/:id', verifyToken, customerController.deleteAddress);

module.exports = router;

