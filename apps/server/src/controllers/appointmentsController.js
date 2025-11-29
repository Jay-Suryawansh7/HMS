const { pool } = require('../config/dbConfigPg');

exports.getAllAppointments = async (req, res) => {
    const client = await pool.connect();
    try {
        const dbName = req.tenantDbName; // From auth middleware

        if (!dbName) {
            return res.status(500).json({ message: 'Tenant database not resolved' });
        }

        // Switch to tenant schema
        await client.query(`SET search_path TO "${dbName}"`);

        const result = await client.query(`
            SELECT 
                a.id,
                a.doctor_id,
                a.patient_id,
                a.time,
                a.status,
                p.name as patient_name,
                d.name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users d ON a.doctor_id = d.id
            ORDER BY a.time DESC
        `);

        res.json({
            success: true,
            appointments: result.rows
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch appointments',
            error: error.message
        });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};
