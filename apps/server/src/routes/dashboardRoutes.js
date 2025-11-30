const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// All routes are protected by authMiddleware (applied in main index.js)

router.get('/admin', dashboardController.getAdminDashboardStats);
router.get('/doctor', dashboardController.getDoctorDashboardStats);
router.get('/nurse', dashboardController.getNurseDashboardStats);
router.get('/receptionist', dashboardController.getReceptionistDashboardStats);
router.get('/pharmacist', dashboardController.getPharmacistDashboardStats);

module.exports = router;
