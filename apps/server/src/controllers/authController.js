const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, pool } = require('../config/dbConfigPg');
const { tenants } = require('../db/publicSchema');
const { users } = require('../db/tenantSchema');
const { eq, sql } = require('drizzle-orm');
const redisClient = require('../config/redisClient');

const generateTokens = (user, tenant) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
        hospitalId: tenant.subdomain // Keeping hospitalId for backward compatibility
    };

    const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET, // Using JWT_ACCESS_SECRET
        { expiresIn: '1d' } // 1 day
    );

    // Refresh token logic can be added here
    return { accessToken };
};

exports.login = async (req, res) => {
    try {
        const { email, password, hospitalId } = req.body;

        if (!email || !password || !hospitalId) {
            return res.status(400).json({ message: 'Email, password, and hospital ID are required' });
        }

        // 1. Find Tenant in Public DB
        const tenantResult = await db.select().from(tenants).where(eq(tenants.subdomain, hospitalId)).limit(1);

        if (tenantResult.length === 0) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        const tenant = tenantResult[0];

        if (tenant.status !== 'ACTIVE' && tenant.status !== 'VERIFIED') {
            // Allowing VERIFIED for now as onboarding sets it to VERIFIED
            return res.status(403).json({ message: 'Hospital account is inactive' });
        }

        // 2. Connect to Tenant DB
        // We use a raw client to set search_path for this request
        const client = await pool.connect();
        try {
            await client.query(`SET search_path TO "${tenant.dbName}"`);

            // 3. Find User
            // We can use raw SQL or Drizzle with the client if we could bind it, 
            // but Drizzle's `db` object is bound to the pool.
            // So we use raw SQL for safety in this isolated context.
            const userResult = await client.query(`SELECT * FROM users WHERE email = $1`, [email]);

            if (userResult.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = userResult.rows[0];

            // 4. Verify Password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // 5. Generate Tokens
            const tokens = generateTokens(user, tenant);

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    hospitalName: tenant.hospitalName,
                    tenantId: tenant.id // Sending tenantId to frontend
                },
                tokens
            });

        } finally {
            await client.query('SET search_path TO public');
            client.release();
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
