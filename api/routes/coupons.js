const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// POST - Validar cupom
router.post('/validate', couponController.validateCoupon);

module.exports = router;
