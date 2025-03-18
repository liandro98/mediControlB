const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.post('/premium', authMiddleware, authController.premium);
router.get('/premium', authMiddleware, authController.obtenerPremium);

module.exports = router;