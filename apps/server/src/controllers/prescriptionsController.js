const { pool } = require('../config/dbConfigPg');
const { generatePrescriptionId } = require('../services/prescriptionIdService');
const { z } = require('zod');

// Zod validation schemas
const medicineItemSchema = z.object({
    medicineName: z.string().min(1, 'Medicine name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    duration: z.string().min(1, 'Duration is required'),
    instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
    patientId: z.number().int().positive('Valid patient ID is required'),
    notes: z.string().optional(),
    medicines: z.array(medicineItemSchema).min(1, 'At least one medicine is required'),
});

// Helper to map DB snake_case to API camelCase
const mapPrescription = (row) => ({
    id: row.id,
    prescriptionId: row.prescription_id,
    doctorId: row.doctor_id,
    patientId: row.patient_id,
    notes: row.notes,
    createdAt: row.created_at,
});

const mapPrescriptionItem = (row) => ({
    id: row.id,
    prescriptionId: row.prescription_id,
    medicineName: row.medicine_name,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    instructions: row.instructions,
});

/**
 * Create a new prescription
 * POST /api/prescriptions
 */
exports.createPrescription = async (req, res) => {
    const client = await pool.connect();

    try {
        // Validate tenant context
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        // Validate request body
        const validatedData = prescriptionSchema.parse(req.body);

        // Set search path to tenant schema
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        // Begin transaction
        await client.query('BEGIN');

        // Generate prescription ID
        const prescriptionId = await generatePrescriptionId(req.tenantDbName, req.tenantId);

        // Get doctor ID from authenticated user
        const doctorId = req.userId;

        // Insert prescription record
        const prescriptionQuery = `
            INSERT INTO prescriptions (
                prescription_id, doctor_id, patient_id, notes, created_at
            ) VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        `;

        const prescriptionValues = [
            prescriptionId,
            doctorId,
            validatedData.patientId,
            validatedData.notes || null,
        ];

        const prescriptionResult = await client.query(prescriptionQuery, prescriptionValues);
        const newPrescription = prescriptionResult.rows[0];

        // Insert prescription items
        const items = [];
        for (const medicine of validatedData.medicines) {
            const itemQuery = `
                INSERT INTO prescription_items (
                    prescription_id, medicine_name, dosage, frequency, duration, instructions
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;

            const itemValues = [
                newPrescription.id,
                medicine.medicineName,
                medicine.dosage,
                medicine.frequency,
                medicine.duration,
                medicine.instructions || null,
            ];

            const itemResult = await client.query(itemQuery, itemValues);
            items.push(mapPrescriptionItem(itemResult.rows[0]));
        }

        // Commit transaction
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Prescription created successfully',
            prescriptionId: prescriptionId,
            prescription: {
                ...mapPrescription(newPrescription),
                medicines: items,
            },
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating prescription:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors,
            });
        }

        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Get a single prescription with items
 * GET /api/prescriptions/:id
 */
exports.getPrescription = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        const { id } = req.params;

        // Get prescription with doctor and patient details
        let prescriptionQuery = `
            SELECT p.*, 
                   u.name as doctor_name,
                   pat.first_name || ' ' || pat.last_name as patient_name
            FROM prescriptions p
            LEFT JOIN users u ON p.doctor_id = u.id
            LEFT JOIN patients pat ON p.patient_id = pat.id
            WHERE p.prescription_id = $1
        `;
        let prescriptionParams = [id];

        if (/^\d+$/.test(id)) {
            prescriptionQuery = `
                SELECT p.*, 
                       u.name as doctor_name,
                       pat.first_name || ' ' || pat.last_name as patient_name
                FROM prescriptions p
                LEFT JOIN users u ON p.doctor_id = u.id
                LEFT JOIN patients pat ON p.patient_id = pat.id
                WHERE p.id = $1 OR p.prescription_id = $2
            `;
            prescriptionParams = [parseInt(id), id];
        }

        const prescriptionResult = await client.query(prescriptionQuery, prescriptionParams);

        if (prescriptionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        const prescription = prescriptionResult.rows[0];

        // Get prescription items
        const itemsQuery = 'SELECT * FROM prescription_items WHERE prescription_id = $1 ORDER BY id';
        const itemsResult = await client.query(itemsQuery, [prescription.id]);

        res.json({
            ...mapPrescription(prescription),
            doctorName: prescription.doctor_name,
            patientName: prescription.patient_name,
            medicines: itemsResult.rows.map(mapPrescriptionItem),
        });
    } catch (error) {
        console.error('Error fetching prescription:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * List prescriptions with pagination
 * GET /api/prescriptions
 */
exports.listPrescriptions = async (req, res) => {
    const client = await pool.connect();

    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        const {
            patientId = '',
            doctorId = '',
            page = 1,
            limit = 20,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (patientId) {
            whereConditions.push(`patient_id = $${paramIndex}`);
            queryParams.push(parseInt(patientId));
            paramIndex++;
        }

        if (doctorId) {
            whereConditions.push(`doctor_id = $${paramIndex}`);
            queryParams.push(parseInt(doctorId));
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM prescriptions ${whereClause}`;
        const countResult = await client.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated results
        const dataQuery = `
            SELECT p.*, 
                   u.name as doctor_name,
                   pat.first_name || ' ' || pat.last_name as patient_name
            FROM prescriptions p
            LEFT JOIN users u ON p.doctor_id = u.id
            LEFT JOIN patients pat ON p.patient_id = pat.id
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const dataResult = await client.query(dataQuery, [...queryParams, parseInt(limit), offset]);

        const lastPage = Math.ceil(total / parseInt(limit));

        const prescriptions = dataResult.rows.map(row => ({
            ...mapPrescription(row),
            doctorName: row.doctor_name,
            patientName: row.patient_name,
        }));

        res.json({
            data: prescriptions,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                lastPage,
            },
        });

    } catch (error) {
        console.error('Error listing prescriptions:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};
