const express = require('express');
const recetaController = require('../controllers/recetaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/save', authMiddleware, recetaController.guardarReceta);

module.exports = router;