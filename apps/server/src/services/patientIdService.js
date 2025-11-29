const { pool } = require('../config/dbConfigPg');

/**
 * Generate sequential patient ID for a tenant
 * Format: {tenantId}-P-{sequential_number}
 * @param {string} tenantDbName - The tenant's database schema name
 * @param {string} tenantId - The tenant's ID
 * @returns {Promise<string>} - The generated patient ID
 */
const generatePatientId = async (tenantDbName, tenantId) => {
    const client = await pool.connect();

    try {
        // Set search path to tenant schema
        await client.query(`SET search_path TO "${tenantDbName}"`);

        // Get the last patient ID for this tenant
        const result = await client.query(
            `SELECT patient_id FROM patients 
             WHERE patient_id LIKE $1 
             ORDER BY id DESC LIMIT 1`,
            [`${tenantId}-P-%`]
        );

        let nextNumber = 1;

        if (result.rows.length > 0) {
            const lastId = result.rows[0].patient_id;
            // Extract the numeric part from the last ID
            const match = lastId.match(/-P-(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        // Format the number with leading zeros (5 digits)
        const paddedNumber = String(nextNumber).padStart(5, '0');
        const patientId = `${tenantId}-P-${paddedNumber}`;

        return patientId;
    } catch (error) {
        console.error('Error generating patient ID:', error);
        throw error;
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

module.exports = {
    generatePatientId
};
