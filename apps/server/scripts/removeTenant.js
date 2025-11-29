/**
 * Script to remove a tenant and its database for testing
 * Usage: node scripts/removeTenant.js <subdomain>
 * Example: node scripts/removeTenant.js cityhospital
 */

const mysql = require('mysql2/promise');
const dbConfig = require('../src/config/dbConfig');

async function removeTenant(subdomain) {
    const connection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        port: dbConfig.port,
    });

    try {
        // Get tenant info from common DB
        await connection.query(`USE ${dbConfig.commonDb}`);
        const [tenants] = await connection.query(
            'SELECT * FROM tenants WHERE subdomain = ?',
            [subdomain]
        );

        if (tenants.length === 0) {
            console.log(`No tenant found with subdomain: ${subdomain}`);
            return;
        }

        const tenant = tenants[0];
        console.log(`Found tenant: ${tenant.hospital_name} (${tenant.db_name})`);

        // Drop the tenant database
        console.log(`Dropping database: ${tenant.db_name}...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${tenant.db_name}\``);

        // Remove from tenants table
        console.log(`Removing from tenants table...`);
        await connection.query('DELETE FROM tenants WHERE subdomain = ?', [subdomain]);

        console.log(`✅ Successfully removed tenant: ${subdomain}`);
    } catch (error) {
        console.error('Error removing tenant:', error);
    } finally {
        await connection.end();
    }
}

// Get subdomain from command line
const subdomain = process.argv[2];

if (!subdomain) {
    console.error('Usage: node removeTenant.js <subdomain>');
    console.error('Example: node removeTenant.js cityhospital');
    process.exit(1);
}

removeTenant(subdomain);
