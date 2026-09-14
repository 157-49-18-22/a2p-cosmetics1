const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');

router.get('/', promoController.getAllPromos);
router.post('/', promoController.createPromo);
router.put('/:id/status', promoController.updatePromoStatus);
router.delete('/:id', promoController.deletePromo);
router.post('/validate', promoController.validatePromo);

module.exports = router;
