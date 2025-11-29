const express = require('express');
const router = express.Router();
const platformAdminController = require('../controllers/platformAdminController');
const platformAuthMiddleware = require('../middleware/platformAuthMiddleware');

// Public route
router.post('/login', platformAdminController.login);

// Protected routes
router.get('/hospitals', platformAuthMiddleware, platformAdminController.getHospitals);
router.patch('/hospitals/:id/status', platformAuthMiddleware, platformAdminController.toggleStatus);

module.exports = router;
