const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const signupController = require('../controllers/signupController');
const passwordController = require('../controllers/passwordController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/signup', signupController.signup);

// Password management routes
router.post('/forgot-password', passwordController.forgotPassword);
router.post('/reset-password/:token', passwordController.resetPasswordWithToken);
router.post('/change-password', authMiddleware, passwordController.changePassword);

module.exports = router;
