const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');

const authorizeRoles = require('../middleware/rbacMiddleware');

router.post('/add', authMiddleware, authorizeRoles('ADMIN'), staffController.addStaff);
router.get('/', authMiddleware, staffController.getStaff);
router.post('/:userId/force-password-change', authMiddleware, authorizeRoles('ADMIN'), staffController.forcePasswordChange);

module.exports = router;

