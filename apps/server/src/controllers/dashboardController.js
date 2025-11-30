const { pool } = require('../config/dbConfigPg');

/**
 * Get Admin Dashboard Statistics
 * GET /api/dashboard/admin
 */
exports.getAdminDashboardStats = async (req, res) => {
    const client = await pool.connect();

    try {
        // Validate tenant context
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        // Set search path to tenant schema
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        // Get total patients count
        const patientsCount = await client.query('SELECT COUNT(*) as count FROM patients');
        const totalPatients = parseInt(patientsCount.rows[0].count);

        // Get total appointments count
        const appointmentsCount = await client.query('SELECT COUNT(*) as count FROM appointments');
        const totalAppointments = parseInt(appointmentsCount.rows[0].count);

        // Get active doctors count (users with role DOCTOR)
        const doctorsCount = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'DOCTOR'");
        const activeDoctors = parseInt(doctorsCount.rows[0].count);

        // Get patient growth data (last 6 months)
        const patientGrowth = await client.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
                COUNT(*) as patients
            FROM patients
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `);

        // Get weekly appointments data (last 7 days)
        const weeklyAppointments = await client.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('day', time), 'Dy') as day,
                COUNT(*) as count
            FROM appointments
            WHERE time >= NOW() - INTERVAL '7 days'
            GROUP BY DATE_TRUNC('day', time)
            ORDER BY DATE_TRUNC('day', time)
        `);

        // Get revenue (if billing table exists, otherwise return null)
        let revenue = null;
        try {
            const revenueResult = await client.query(`
                SELECT COALESCE(SUM(amount), 0) as total
                FROM billing
                WHERE created_at >= DATE_TRUNC('month', NOW())
            `);
            revenue = parseFloat(revenueResult.rows[0]?.total || 0);
        } catch (error) {
            // Billing table might not exist yet
            revenue = null;
        }

        res.json({
            hasData: totalPatients > 0 || totalAppointments > 0,
            stats: {
                totalPatients,
                totalAppointments,
                activeDoctors,
                revenue,
            },
            patientGrowthData: patientGrowth.rows,
            appointmentsData: weeklyAppointments.rows,
        });

    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Get Doctor Dashboard Statistics
 * GET /api/dashboard/doctor
 */
exports.getDoctorDashboardStats = async (req, res) => {
    const client = await pool.connect();

    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        const userId = req.user.id;

        // Get today's appointments for this doctor
        const todayAppointments = await client.query(`
            SELECT COUNT(*) as count
            FROM appointments
            WHERE doctor_id = $1 
            AND DATE(time) = CURRENT_DATE
        `, [userId]);

        // Get completed appointments today
        const completedToday = await client.query(`
            SELECT COUNT(*) as count
            FROM appointments
            WHERE doctor_id = $1 
            AND DATE(time) = CURRENT_DATE
            AND status = 'COMPLETED'
        `, [userId]);

        // Get pending prescriptions (appointments without prescriptions)
        const pendingDiagnosis = await client.query(`
            SELECT COUNT(*) as count
            FROM appointments a
            LEFT JOIN prescriptions p ON a.id = p.appointment_id
            WHERE a.doctor_id = $1 
            AND a.status = 'SCHEDULED'
            AND p.id IS NULL
        `, [userId]);

        // Get critical patients (IPD patients)
        const criticalPatients = await client.query(`
            SELECT COUNT(*) as count
            FROM patients
            WHERE patient_type = 'IPD'
        `);

        // Get hourly appointment trends for today
        const hourlyTrends = await client.query(`
            SELECT 
                EXTRACT(HOUR FROM time) as hour,
                COUNT(*) as count
            FROM appointments
            WHERE doctor_id = $1 
            AND DATE(time) = CURRENT_DATE
            GROUP BY EXTRACT(HOUR FROM time)
            ORDER BY EXTRACT(HOUR FROM time)
        `, [userId]);

        // Get recovery rate data (last 7 days - based on completed appointments)
        const recoveryData = await client.query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('day', time), 'Dy') as day,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') * 100.0 / NULLIF(COUNT(*), 0) as rate
            FROM appointments
            WHERE doctor_id = $1 
            AND time >= NOW() - INTERVAL '7 days'
            GROUP BY DATE_TRUNC('day', time)
            ORDER BY DATE_TRUNC('day', time)
        `, [userId]);

        const totalAppointments = parseInt(todayAppointments.rows[0].count);
        const hasData = totalAppointments > 0;

        res.json({
            hasData,
            stats: {
                pendingSurgeries: 0, // Placeholder - would need a surgeries table
                pendingDiagnosis: parseInt(pendingDiagnosis.rows[0].count),
                todayAppointments: totalAppointments,
                todayCompleted: parseInt(completedToday.rows[0].count),
                criticalPatients: parseInt(criticalPatients.rows[0].count),
            },
            recoveryData: recoveryData.rows,
            appointmentsTrend: hourlyTrends.rows,
        });

    } catch (error) {
        console.error('Error fetching doctor dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Get Nurse Dashboard Statistics
 * GET /api/dashboard/nurse
 */
exports.getNurseDashboardStats = async (req, res) => {
    const client = await pool.connect();

    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        const userId = req.user.id;

        // Get assigned tasks
        const assignedTasks = await client.query(`
            SELECT COUNT(*) as count
            FROM tasks
            WHERE assigned_to = $1 
            AND status != 'COMPLETED'
        `, [userId]);

        // Get critical alerts (IPD patients)
        const criticalAlerts = await client.query(`
            SELECT COUNT(*) as count
            FROM patients
            WHERE patient_type = 'IPD'
        `);

        // Get total patients
        const totalPatients = await client.query('SELECT COUNT(*) as count FROM patients');

        const taskCount = parseInt(assignedTasks.rows[0].count);
        const hasData = taskCount > 0 || parseInt(totalPatients.rows[0].count) > 0;

        res.json({
            hasData,
            stats: {
                assignedTasks: taskCount,
                criticalAlerts: parseInt(criticalAlerts.rows[0].count),
                assignedPatients: parseInt(totalPatients.rows[0].count),
            },
        });

    } catch (error) {
        console.error('Error fetching nurse dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Get Receptionist Dashboard Statistics
 * GET /api/dashboard/receptionist
 */
exports.getReceptionistDashboardStats = async (req, res) => {
    const client = await pool.connect();

    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        // Get today's appointments
        const todayAppointments = await client.query(`
            SELECT COUNT(*) as count
            FROM appointments
            WHERE DATE(time) = CURRENT_DATE
        `);

        // Get pending appointments
        const pendingAppointments = await client.query(`
            SELECT COUNT(*) as count
            FROM appointments
            WHERE status = 'SCHEDULED'
            AND time >= NOW()
        `);

        // Get today's check-ins (patients registered today)
        const todayCheckIns = await client.query(`
            SELECT COUNT(*) as count
            FROM patients
            WHERE DATE(created_at) = CURRENT_DATE
        `);

        const totalAppointments = parseInt(todayAppointments.rows[0].count);
        const hasData = totalAppointments > 0;

        res.json({
            hasData,
            stats: {
                todayCheckIns: parseInt(todayCheckIns.rows[0].count),
                todayAppointments: totalAppointments,
                pendingAppointments: parseInt(pendingAppointments.rows[0].count),
            },
        });

    } catch (error) {
        console.error('Error fetching receptionist dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Get Pharmacist Dashboard Statistics
 * GET /api/dashboard/pharmacist
 */
exports.getPharmacistDashboardStats = async (req, res) => {
    const client = await pool.connect();

    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        // Get pending prescriptions
        const pendingPrescriptions = await client.query(`
            SELECT COUNT(*) as count
            FROM prescriptions
            WHERE status = 'PENDING'
        `);

        // Get today's dispensations
        const todayDispensed = await client.query(`
            SELECT COUNT(*) as count
            FROM prescriptions
            WHERE DATE(created_at) = CURRENT_DATE
        `);

        // Get total prescriptions
        const totalPrescriptions = await client.query('SELECT COUNT(*) as count FROM prescriptions');

        const prescriptionCount = parseInt(totalPrescriptions.rows[0].count);
        const hasData = prescriptionCount > 0;

        res.json({
            hasData,
            stats: {
                pendingPrescriptions: parseInt(pendingPrescriptions.rows[0].count),
                todayDispensed: parseInt(todayDispensed.rows[0].count),
                totalPrescriptions: prescriptionCount,
            },
        });

    } catch (error) {
        console.error('Error fetching pharmacist dashboard stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};
