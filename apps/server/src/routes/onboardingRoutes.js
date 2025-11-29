const express = require('express');
const router = express.Router();
const tenantService = require('../services/tenantService');

router.post('/onboard-hospital', async (req, res) => {
    try {
        const result = await tenantService.onboardHospital(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
