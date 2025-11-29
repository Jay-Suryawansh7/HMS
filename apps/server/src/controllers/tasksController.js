const { pool } = require('../config/dbConfigPg');

exports.assignTask = async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, description, assignedTo } = req.body;
        const dbName = req.tenantDbName;
        const assignedBy = req.userId;

        if (!title || !assignedTo) {
            return res.status(400).json({ message: 'Title and assignedTo are required' });
        }

        if (!dbName) {
            return res.status(500).json({ message: 'Tenant database not resolved' });
        }

        await client.query(`SET search_path TO "${dbName}"`);

        // Verify assignee exists and check role constraints
        const assigneeResult = await client.query('SELECT id, role FROM users WHERE id = $1', [assignedTo]);

        if (assigneeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Assignee not found' });
        }

        const assignee = assigneeResult.rows[0];

        // Strict RBAC: Nurse can ONLY assign to Receptionist
        if (req.userRole === 'NURSE' && assignee.role !== 'RECEPTIONIST') {
            return res.status(403).json({
                message: 'Nurses can only assign tasks to Receptionists'
            });
        }

        const result = await client.query(
            `INSERT INTO tasks (title, description, assigned_to, assigned_by, status)
             VALUES ($1, $2, $3, $4, 'PENDING') RETURNING id`,
            [title, description, assignedTo, assignedBy]
        );

        res.status(201).json({
            message: 'Task assigned successfully',
            taskId: result.rows[0].id
        });

    } catch (error) {
        console.error('Assign task error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};

exports.getTasks = async (req, res) => {
    const client = await pool.connect();
    try {
        const dbName = req.tenantDbName;
        const userId = req.userId;

        if (!dbName) {
            return res.status(500).json({ message: 'Tenant database not resolved' });
        }

        await client.query(`SET search_path TO "${dbName}"`);

        // Get tasks assigned TO the user
        const result = await client.query(`
            SELECT t.*, u.name as assigned_by_name 
            FROM tasks t
            JOIN users u ON t.assigned_by = u.id
            WHERE t.assigned_to = $1
            ORDER BY t.created_at DESC
        `, [userId]);

        res.json({ tasks: result.rows });

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.query('SET search_path TO public');
        client.release();
    }
};
