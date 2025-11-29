const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });

    try {
        const commonDbName = process.env.DB_COMMON_NAME || 'hms_common';
        console.log(`Creating database if not exists: ${commonDbName}`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${commonDbName}\``);
        console.log('Database created or already exists.');

        // Now connect to the common DB to create the table
        await connection.changeUser({ database: commonDbName });

        console.log('Creating tenants table if not exists...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id CHAR(36) PRIMARY KEY,
        hospital_name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(255) NOT NULL UNIQUE,
        db_name VARCHAR(255) NOT NULL,
        license_key VARCHAR(255),
        status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Tenants table initialized.');

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

initDb();
