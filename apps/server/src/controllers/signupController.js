const tenantService = require('../services/tenantService');

exports.signup = async (req, res) => {
    try {
        const { hospitalName, subdomain, adminEmail, adminName, password } = req.body;

        // Validate input
        if (!hospitalName || !subdomain || !adminEmail || !adminName || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Use TenantService to handle the entire onboarding process
        // Note: TenantService expects 'licenseKey' which is not in the signup body.
        // We generate a mock license key here.
        const licenseKey = `LICENSE-${Date.now()}`;

        const result = await tenantService.onboardHospital({
            hospitalName,
            subdomain,
            licenseKey,
            adminEmail,
            adminName,  // Pass adminName
            adminPassword: password,
            address: 'N/A', // Default
            contact: 'N/A'  // Default
        });

        res.status(201).json({
            message: 'Hospital created successfully',
            hospitalId: subdomain,
            tenantId: result.tenantId
        });

    } catch (error) {
        console.error('Signup error:', error);
        if (error.message === 'Subdomain already taken') {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
