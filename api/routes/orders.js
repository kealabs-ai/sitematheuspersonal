const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST - Criar pedido
router.post('/', orderController.createOrder);

// GET - Buscar pedido por ID
router.get('/:id', orderController.getOrderById);

module.exports = router;
