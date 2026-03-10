const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// POST - Criar lead
router.post('/', leadController.createLead);

module.exports = router;
