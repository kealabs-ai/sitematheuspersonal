const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST - Criar usuário
router.post('/', userController.createUser);

// GET - Buscar usuário por ID
router.get('/:id', userController.getUserById);

module.exports = router;
