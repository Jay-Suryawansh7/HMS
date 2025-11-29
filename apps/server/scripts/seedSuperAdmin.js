const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'hms_master',
    password: process.env.PG_PASSWORD || 'postgrespassword',
    port: process.env.PG_PORT || 5432,
});

async function seedSuperAdmin() {
    const client = await pool.connect();
    try {
        console.log('--- Seeding Super Admin ---');

        // 1. Create platform_users table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS platform_users (
                id TEXT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Table platform_users verified/created.');

        // 2. Check if super admin exists
        const check = await client.query("SELECT * FROM platform_users WHERE email = 'superadmin@hms.com'");
        if (check.rows.length > 0) {
            console.log('Super Admin already exists.');
            return;
        }

        // 3. Create Super Admin
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        const id = uuidv4();

        await client.query(`
            INSERT INTO platform_users (id, email, password, name, role)
            VALUES ($1, $2, $3, $4, 'SUPER_ADMIN')
        `, [id, 'superadmin@hms.com', hashedPassword, 'Platform Admin']);

        console.log('Super Admin created successfully.');
        console.log('Email: superadmin@hms.com');
        console.log('Password: superadmin123');

    } catch (err) {
        console.error('Error seeding super admin:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seedSuperAdmin();
