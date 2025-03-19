const express = require('express');
const medicamentoController = require('../controllers/medicamentoController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/consulta', authMiddleware, medicamentoController.obtenerMedicamentos);
router.get('/estadisticas', authMiddleware, medicamentoController.obtenerEstadisticas);

module.exports = router;