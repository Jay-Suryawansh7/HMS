const express = require('express');
const { getAllAppointments, createAppointment } = require('../controllers/appointmentsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all appointments for the tenant
router.get('/', authMiddleware, getAllAppointments);

// Create new appointment
router.post('/', authMiddleware, createAppointment);

module.exports = router;
