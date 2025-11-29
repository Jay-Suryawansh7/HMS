const { pool } = require('../config/dbConfigPg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;

        // Check platform_users table
        const result = await client.query(
            'SELECT * FROM platform_users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role, type: 'PLATFORM_ADMIN' },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Platform login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};

exports.getHospitals = async (req, res) => {
    const client = await pool.connect();
    try {
        // 1. Get all tenants
        const tenantsResult = await client.query('SELECT * FROM tenants ORDER BY created_at DESC');
        const tenants = tenantsResult.rows;

        const hospitals = [];

        // 2. For each tenant, get stats
        for (const tenant of tenants) {
            let stats = {
                doctors: 0,
                nurses: 0,
                staff: 0,
                patients: 0
            };

            try {
                // Switch to tenant schema
                await client.query(`SET search_path TO "${tenant.db_name}"`);

                // Count users by role
                const usersCount = await client.query(`
                    SELECT role, COUNT(*) as count 
                    FROM users 
                    GROUP BY role
                `);

                usersCount.rows.forEach(row => {
                    if (row.role === 'DOCTOR') stats.doctors = parseInt(row.count);
                    else if (row.role === 'NURSE') stats.nurses = parseInt(row.count);
                    else if (row.role !== 'ADMIN') stats.staff += parseInt(row.count); // Other staff
                });

                // Count patients (if table exists)
                // We assume patients table exists if tenant is verified
                if (tenant.status === 'VERIFIED' || tenant.status === 'ACTIVE') {
                    const patientsCount = await client.query('SELECT COUNT(*) as count FROM patients');
                    stats.patients = parseInt(patientsCount.rows[0].count);
                }

            } catch (err) {
                console.warn(`Could not fetch stats for tenant ${tenant.hospital_name}:`, err.message);
                // Continue even if one tenant fails
            }

            hospitals.push({
                ...tenant,
                stats
            });
        }

        res.json(hospitals);

    } catch (error) {
        console.error('Get hospitals error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        // Reset search path
        await client.query('SET search_path TO public');
        client.release();
    }
};

exports.toggleStatus = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status } = req.body; // 'ACTIVE' or 'INACTIVE'

        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await client.query(
            'UPDATE tenants SET status = $1 WHERE id = $2',
            [status, id]
        );

        res.json({ message: `Hospital status updated to ${status}` });

    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        client.release();
    }
};
