const express = require('express');
const medicamentoController = require('../controllers/medicamentoController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/consulta', authMiddleware, medicamentoController.obtenerMedicamentos);

module.exports = router;