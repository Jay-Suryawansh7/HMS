const express = require('express');
const router = express.Router();
const prescriptionsController = require('../controllers/prescriptionsController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// Create prescription (Doctor only)
router.post('/', authMiddleware, authorizeRoles('DOCTOR'), prescriptionsController.createPrescription);

// Get single prescription
router.get('/:id', authMiddleware, prescriptionsController.getPrescription);

// List prescriptions
router.get('/', authMiddleware, prescriptionsController.listPrescriptions);

module.exports = router;
