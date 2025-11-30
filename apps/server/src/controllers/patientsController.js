const { pool } = require('../config/dbConfigPg');
const { generatePatientId } = require('../services/patientIdService');
const { z } = require('zod');
const { stringify } = require('csv-stringify/sync');

// Helper to map DB snake_case to API camelCase
const mapPatient = (row) => ({
    id: row.id,
    patientId: row.patient_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dob: row.dob,
    gender: row.gender,
    bloodGroup: row.blood_group,
    phone: row.phone,
    email: row.email,
    address: row.address,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    patientType: row.patient_type,
    photoUrl: row.photo_url,
    history: row.history,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

// Zod validation schema for patient registration
const patientRegistrationSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dob: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    bloodGroup: z.string().optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
    emergencyContactPhone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
    patientType: z.enum(['OPD', 'IPD']),
    history: z.string().optional(),
    admissionNotes: z.string().optional(),
});

/**
 * Register a new patient
 * POST /api/patients
 */
exports.registerPatient = async (req, res) => {
    const client = await pool.connect();

    try {
        // Validate tenant context
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        // Validate request body
        const validatedData = patientRegistrationSchema.parse(req.body);

        // Set search path to tenant schema
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        // Generate patient ID
        const patientId = await generatePatientId(req.tenantDbName, req.tenantId);

        // Get photo URL if file was uploaded
        const photoUrl = req.file ? `/uploads/tenants/${req.tenantId}/patients/${req.file.filename}` : null;

        // Insert patient record
        const insertQuery = `
            INSERT INTO patients (
                patient_id, first_name, last_name, dob, gender, blood_group, 
                phone, email, address, emergency_contact_name, emergency_contact_phone, 
                patient_type, photo_url, history, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
            RETURNING *
        `;

        const values = [
            patientId,
            validatedData.firstName,
            validatedData.lastName,
            validatedData.dob || null,
            validatedData.gender || null,
            validatedData.bloodGroup || null,
            validatedData.phone,
            validatedData.email || null,
            validatedData.address || null,
            validatedData.emergencyContactName,
            validatedData.emergencyContactPhone,
            validatedData.patientType,
            photoUrl,
            validatedData.history || null
        ];

        const result = await client.query(insertQuery, values);
        const newPatient = mapPatient(result.rows[0]);

        res.status(201).json({
            message: 'Patient registered successfully',
            patientId: patientId,
            patient: newPatient
        });

    } catch (error) {
        console.error('Error registering patient:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors
            });
        }

        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * List and search patients
 * GET /api/patients
 * Query params: search, patientType, dateFrom, dateTo, page, limit
 */
exports.listPatients = async (req, res) => {
    const client = await pool.connect();

    try {
        // Validate tenant context
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        // Set search path to tenant schema
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        // Parse query parameters
        const {
            search = '',
            patientType = '',
            dateFrom = '',
            dateTo = '',
            page = 1,
            limit = 20
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        // Search filter (partial match on name, phone, email, or exact match on patient_id)
        if (search) {
            whereConditions.push(`(
                LOWER(first_name || ' ' || last_name) LIKE LOWER($${paramIndex}) OR
                phone LIKE $${paramIndex} OR
                email LIKE LOWER($${paramIndex}) OR
                patient_id = $${paramIndex + 1}
            )`);
            queryParams.push(`%${search}%`, search);
            paramIndex += 2;
        }

        // Patient type filter
        if (patientType) {
            whereConditions.push(`patient_type = $${paramIndex}`);
            queryParams.push(patientType);
            paramIndex++;
        }

        // Date range filter
        if (dateFrom) {
            whereConditions.push(`created_at >= $${paramIndex}`);
            queryParams.push(dateFrom);
            paramIndex++;
        }

        if (dateTo) {
            whereConditions.push(`created_at <= $${paramIndex}`);
            queryParams.push(dateTo);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM patients ${whereClause}`;
        const countResult = await client.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);

        // Get paginated results
        const dataQuery = `
            SELECT * FROM patients 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const dataResult = await client.query(dataQuery, [...queryParams, parseInt(limit), offset]);

        const lastPage = Math.ceil(total / parseInt(limit));

        res.json({
            data: dataResult.rows.map(mapPatient),
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                lastPage
            }
        });

    } catch (error) {
        console.error('Error listing patients:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Export patients to CSV
 * GET /api/patients/export
 */
exports.exportPatients = async (req, res) => {
    const client = await pool.connect();

    try {
        // Validate tenant context
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        // Set search path to tenant schema
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        // Parse query parameters (same as list)
        const {
            search = '',
            patientType = '',
            dateFrom = '',
            dateTo = ''
        } = req.query;

        // Build WHERE clause (same logic as listPatients)
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (search) {
            whereConditions.push(`(
                LOWER(first_name || ' ' || last_name) LIKE LOWER($${paramIndex}) OR
                phone LIKE $${paramIndex} OR
                email LIKE LOWER($${paramIndex}) OR
                patient_id = $${paramIndex + 1}
            )`);
            queryParams.push(`%${search}%`, search);
            paramIndex += 2;
        }

        if (patientType) {
            whereConditions.push(`patient_type = $${paramIndex}`);
            queryParams.push(patientType);
            paramIndex++;
        }

        if (dateFrom) {
            whereConditions.push(`created_at >= $${paramIndex}`);
            queryParams.push(dateFrom);
            paramIndex++;
        }

        if (dateTo) {
            whereConditions.push(`created_at <= $${paramIndex}`);
            queryParams.push(dateTo);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get all matching records
        const query = `SELECT * FROM patients ${whereClause} ORDER BY created_at DESC`;
        const result = await client.query(query, queryParams);

        // Convert to CSV
        const csv = stringify(result.rows.map(mapPatient), {
            header: true,
            columns: [
                'patientId', 'firstName', 'lastName', 'dob', 'gender', 'bloodGroup',
                'phone', 'email', 'address', 'emergencyContactName', 'emergencyContactPhone',
                'patientType', 'createdAt'
            ]
        });

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=patients-${Date.now()}.csv`);
        res.send(csv);

    } catch (error) {
        console.error('Error exporting patients:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Get a single patient by ID
 * GET /api/patients/:id
 */
exports.getPatient = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        const { id } = req.params;

        let queryStr = 'SELECT * FROM patients WHERE patient_id = $1';
        let queryParams = [id];

        // If id is numeric, it might be the PK.
        if (/^\d+$/.test(id)) {
            queryStr = 'SELECT * FROM patients WHERE id = $1 OR patient_id = $2';
            queryParams = [parseInt(id), id];
        }

        const result = await client.query(queryStr, queryParams);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(mapPatient(result.rows[0]));
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Update a patient
 * PUT /api/patients/:id
 */
exports.updatePatient = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }

        const validatedData = patientRegistrationSchema.parse(req.body);

        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        const { id } = req.params;

        // Check if patient exists
        let checkQuery = 'SELECT * FROM patients WHERE patient_id = $1';
        let checkParams = [id];
        if (/^\d+$/.test(id)) {
            checkQuery = 'SELECT * FROM patients WHERE id = $1 OR patient_id = $2';
            checkParams = [parseInt(id), id];
        }
        const checkResult = await client.query(checkQuery, checkParams);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const currentPatient = checkResult.rows[0];
        const targetId = currentPatient.id;

        // Handle photo
        let photoUrl = currentPatient.photo_url;
        if (req.file) {
            photoUrl = `/uploads/tenants/${req.tenantId}/patients/${req.file.filename}`;
        }

        const updateQuery = `
            UPDATE patients SET
                first_name = $1, last_name = $2, dob = $3, gender = $4, blood_group = $5,
                phone = $6, email = $7, address = $8, emergency_contact_name = $9, emergency_contact_phone = $10,
                patient_type = $11, photo_url = $12, history = $13, updated_at = NOW()
            WHERE id = $14
            RETURNING *
        `;

        const values = [
            validatedData.firstName, validatedData.lastName, validatedData.dob || null, validatedData.gender || null, validatedData.bloodGroup || null,
            validatedData.phone, validatedData.email || null, validatedData.address || null, validatedData.emergencyContactName, validatedData.emergencyContactPhone,
            validatedData.patientType, photoUrl, validatedData.history || null,
            targetId
        ];

        const result = await client.query(updateQuery, values);

        res.json({
            message: 'Patient updated successfully',
            patient: mapPatient(result.rows[0])
        });

    } catch (error) {
        console.error('Error updating patient:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

/**
 * Delete a patient
 * DELETE /api/patients/:id
 */
exports.deletePatient = async (req, res) => {
    const client = await pool.connect();
    try {
        if (!req.tenantId || !req.tenantDbName) {
            return res.status(400).json({ message: 'Tenant context not found' });
        }
        await client.query(`SET search_path TO "${req.tenantDbName}"`);

        const { id } = req.params;

        let query = 'DELETE FROM patients WHERE patient_id = $1 RETURNING id';
        let params = [id];
        if (/^\d+$/.test(id)) {
            query = 'DELETE FROM patients WHERE id = $1 OR patient_id = $2 RETURNING id';
            params = [parseInt(id), id];
        }

        const result = await client.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};
