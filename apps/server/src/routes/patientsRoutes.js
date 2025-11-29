const express = require('express');
const router = express.Router();
const patientsController = require('../controllers/patientsController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const upload = require('../config/uploadConfig');

// All routes require authentication and tenant context
router.use(authMiddleware);
router.use(tenantMiddleware);

// Register a new patient (with photo upload)
router.post('/', upload.single('photo'), patientsController.registerPatient);

// List/search patients
router.get('/', patientsController.listPatients);

// Export patients to CSV
router.get('/export', patientsController.exportPatients);

// Get single patient
router.get('/:id', patientsController.getPatient);

// Update patient (with photo upload)
router.put('/:id', upload.single('photo'), patientsController.updatePatient);

// Delete patient
router.delete('/:id', patientsController.deletePatient);

module.exports = router;
