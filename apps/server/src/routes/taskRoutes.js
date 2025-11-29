const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// Only Doctors and Nurses can assign tasks
router.post('/assign', authMiddleware, authorizeRoles('DOCTOR', 'NURSE'), tasksController.assignTask);

// Any authenticated user can view their tasks
router.get('/', authMiddleware, tasksController.getTasks);

module.exports = router;
