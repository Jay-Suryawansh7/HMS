const express = require('express');
const { getAllAppointments } = require('../controllers/appointmentsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all appointments for the tenant
router.get('/', authMiddleware, getAllAppointments);

module.exports = router;
