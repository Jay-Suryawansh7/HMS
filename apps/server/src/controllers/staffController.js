const bcrypt = require('bcryptjs');
const { pool } = require('../config/dbConfigPg');

exports.addStaff = async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, email, role, password } = req.body;
        const dbName = req.tenantDbName; // From auth middleware

        // Validate input
        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate role
        const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'RECEPTIONIST', 'PHARMACIST'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (!dbName) {
            return res.status(500).json({ message: 'Tenant database not resolved' });
        }

        // Switch to tenant schema
        await client.query(`SET search_path TO "${dbName}"`);

        // Check if email already exists
        const existingUser = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new staff member
        const result = await client.query(
            `INSERT INTO users (name, email, password, role, status) 
             VALUES ($1, $2, $3, $4, 'ACTIVE') RETURNING id`,
            [name, email, hashedPassword, role]
        );

        res.status(201).json({
            message: 'Staff member added successfully',
            staffId: result.rows[0].id,
        });

    } catch (error) {
        console.error('Add staff error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

exports.getStaff = async (req, res) => {
    const client = await pool.connect();
    try {
        const dbName = req.tenantDbName; // From auth middleware

        if (!dbName) {
            return res.status(500).json({ message: 'Tenant database not resolved' });
        }

        // Switch to tenant schema
        await client.query(`SET search_path TO "${dbName}"`);

        // Get all staff members
        const result = await client.query(
            'SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC'
        );

        res.json({ staff: result.rows });

    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Force password change for a user (Admin only)
 * POST /api/staff/:userId/force-password-change
 */
exports.forcePasswordChange = async (req, res) => {
    const client = await pool.connect();
    try {
        const { userId } = req.params;
        const dbName = req.tenantDbName;

        if (!dbName) {
            return res.status(500).json({ message: 'Tenant database not resolved' });
        }

        // Switch to tenant schema
        await client.query(`SET search_path TO "${dbName}"`);

        // Update user to force password change
        const result = await client.query(
            `UPDATE users SET force_password_change = 'true' WHERE id = $1 RETURNING id, name, email`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User will be required to change password on next login',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Force password change error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};
