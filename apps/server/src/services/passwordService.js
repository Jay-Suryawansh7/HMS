const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Generate a secure random token for password reset
 * @returns {string} - Random token (hex string)
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token for secure storage
 * @param {string} token - Plain token
 * @returns {string} - Hashed token
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Check if password was used in recent history
 * @param {object} client - Database client
 * @param {number} userId - User ID
 * @param {string} newPasswordPlain - New password (plain text)
 * @param {number} limit - Number of previous passwords to check
 * @returns {Promise<boolean>} - true if password was used recently, false otherwise
 */
const checkPasswordHistory = async (client, userId, newPasswordPlain, limit = 3) => {
    try {
        const historyResult = await client.query(
            `SELECT password_hash FROM password_history 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [userId, limit]
        );

        for (const row of historyResult.rows) {
            const isMatch = await bcrypt.compare(newPasswordPlain, row.password_hash);
            if (isMatch) {
                return true; // Password was used recently
            }
        }

        return false; // Password is new
    } catch (error) {
        console.error('Error checking password history:', error);
        throw error;
    }
};

/**
 * Add password to history
 * @param {object} client - Database client
 * @param {number} userId - User ID
 * @param {string} passwordHash - Hashed password
 */
const addPasswordToHistory = async (client, userId, passwordHash) => {
    try {
        await client.query(
            `INSERT INTO password_history (user_id, password_hash, created_at) 
             VALUES ($1, $2, NOW())`,
            [userId, passwordHash]
        );
    } catch (error) {
        console.error('Error adding password to history:', error);
        throw error;
    }
};

module.exports = {
    generateResetToken,
    hashToken,
    validatePassword,
    checkPasswordHistory,
    addPasswordToHistory
};
