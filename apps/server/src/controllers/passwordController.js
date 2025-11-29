const bcrypt = require('bcryptjs');
const { pool } = require('../config/dbConfigPg');
const { generateResetToken, hashToken, validatePassword, checkPasswordHistory, addPasswordToHistory } = require('../services/passwordService');
const { sendPasswordResetEmail } = require('../services/emailService');
const redisClient = require('../config/redisClient');

/**
 * Forgot Password - Request password reset
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, hospitalId } = req.body;

        if (!email || !hospitalId) {
            return res.status(400).json({ message: 'Email and hospital ID are required' });
        }

        // Get tenant info from public schema
        await client.query('SET search_path TO public');
        const tenantResult = await client.query(
            'SELECT id, db_name FROM tenants WHERE subdomain = $1',
            [hospitalId]
        );

        if (tenantResult.rows.length === 0) {
            // Don't reveal if hospital exists for security
            return res.json({ message: 'If the email exists, a password reset link has been sent' });
        }

        const tenant = tenantResult.rows[0];
        const tenantDbName = tenant.db_name;

        // Switch to tenant schema
        await client.query(`SET search_path TO "${tenantDbName}"`);

        // Find user by email
        const userResult = await client.query(
            'SELECT id, email, name FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
            // Don't reveal if user exists for security
            return res.json({ message: 'If the email exists, a password reset link has been sent' });
        }

        const user = userResult.rows[0];

        // Generate reset token
        const plainToken = generateResetToken();
        const hashedToken = hashToken(plainToken);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store hashed token in database
        await client.query(
            `INSERT INTO password_reset_tokens (user_id, token, expires_at, used, created_at)
             VALUES ($1, $2, $3, 'false', NOW())`,
            [user.id, hashedToken, expiresAt]
        );

        // Send email with plain token
        await sendPasswordResetEmail(user.email, plainToken);

        res.json({ message: 'If the email exists, a password reset link has been sent' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Reset Password with Token
 * POST /api/auth/reset-password/:token
 */
exports.resetPasswordWithToken = async (req, res) => {
    const client = await pool.connect();
    try {
        const { token } = req.params;
        const { password, hospitalId } = req.body;

        if (!password || !hospitalId) {
            return res.status(400).json({ message: 'Password and hospital ID are required' });
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        // Get tenant info
        await client.query('SET search_path TO public');
        const tenantResult = await client.query(
            'SELECT id, db_name FROM tenants WHERE subdomain = $1',
            [hospitalId]
        );

        if (tenantResult.rows.length === 0) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        const tenant = tenantResult.rows[0];
        const tenantDbName = tenant.db_name;

        // Switch to tenant schema
        await client.query(`SET search_path TO "${tenantDbName}"`);

        // Hash the provided token and find it
        const hashedToken = hashToken(token);
        const tokenResult = await client.query(
            `SELECT * FROM password_reset_tokens 
             WHERE token = $1 AND used = 'false' AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [hashedToken]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const resetToken = tokenResult.rows[0];

        // Get user's current password
        const userResult = await client.query(
            'SELECT id, password FROM users WHERE id = $1',
            [resetToken.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Check if password was used in history
        const wasUsedRecently = await checkPasswordHistory(client, user.id, password, 3);
        if (wasUsedRecently) {
            return res.status(400).json({
                message: 'Password was recently used. Please choose a different password'
            });
        }

        // Begin transaction
        await client.query('BEGIN');

        // Add old password to history
        await addPasswordToHistory(client, user.id, user.password);

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query(
            `UPDATE users SET password = $1, password_last_changed = NOW(), force_password_change = 'false' 
             WHERE id = $2`,
            [hashedPassword, user.id]
        );

        // Mark token as used
        await client.query(
            `UPDATE password_reset_tokens SET used = 'true' WHERE id = $1`,
            [resetToken.id]
        );

        // Invalidate all user sessions
        const sessionKeys = await redisClient.keys(`session:${user.id}:*`);
        if (sessionKeys.length > 0) {
            await redisClient.del(sessionKeys);
        }

        await client.query('COMMIT');

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Change Password (authenticated)
 * POST /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
    const client = await pool.connect();
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.userId; // From auth middleware
        const tenantDbName = req.tenantDbName;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old and new passwords are required' });
        }

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                message: 'New password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        // Switch to tenant schema
        await client.query(`SET search_path TO "${tenantDbName}"`);

        // Get user's current password
        const userResult = await client.query(
            'SELECT id, password FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Verify old password
        const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidOldPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Check if new password was used in history
        const wasUsedRecently = await checkPasswordHistory(client, user.id, newPassword, 3);
        if (wasUsedRecently) {
            return res.status(400).json({
                message: 'Password was recently used. Please choose a different password'
            });
        }

        // Begin transaction
        await client.query('BEGIN');

        // Add old password to history
        await addPasswordToHistory(client, user.id, user.password);

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await client.query(
            `UPDATE users SET password = $1, password_last_changed = NOW(), force_password_change = 'false' 
             WHERE id = $2`,
            [hashedPassword, user.id]
        );

        await client.query('COMMIT');

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

module.exports = exports;
