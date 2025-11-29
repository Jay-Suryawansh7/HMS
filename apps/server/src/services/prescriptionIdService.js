const { pool } = require('../config/dbConfigPg');

/**
 * Generate sequential prescription ID for a tenant
 * Format: {tenantId}-RX-{sequential_number}
 * @param {string} tenantDbName - The tenant's database schema name
 * @param {string} tenantId - The tenant's ID
 * @returns {Promise<string>} - The generated prescription ID
 */
const generatePrescriptionId = async (tenantDbName, tenantId) => {
    const client = await pool.connect();

    try {
        // Set search path to tenant schema
        await client.query(`SET search_path TO "${tenantDbName}"`);

        // Get the last prescription ID for this tenant
        const result = await client.query(
            `SELECT prescription_id FROM prescriptions 
             WHERE prescription_id LIKE $1 
             ORDER BY id DESC LIMIT 1`,
            [`${tenantId}-RX-%`]
        );

        let nextNumber = 1;

        if (result.rows.length > 0) {
            const lastId = result.rows[0].prescription_id;
            // Extract the numeric part from the last ID
            const match = lastId.match(/-RX-(\\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        // Format the number with leading zeros (5 digits)
        const paddedNumber = String(nextNumber).padStart(5, '0');
        const prescriptionId = `${tenantId}-RX-${paddedNumber}`;

        return prescriptionId;
    } catch (error) {
        console.error('Error generating prescription ID:', error);
        throw error;
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

module.exports = {
    generatePrescriptionId
};
