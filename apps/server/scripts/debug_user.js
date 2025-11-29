const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hms_master',
    password: 'postgrespassword',
    port: 5432,
});

async function debugUsers() {
    const client = await pool.connect();
    try {
        console.log('--- TENANTS ---');
        const tenants = await client.query('SELECT * FROM tenants');
        console.table(tenants.rows);

        for (const tenant of tenants.rows) {
            console.log(`\n--- USERS IN ${tenant.name} (${tenant.subdomain}) ---`);
            try {
                // Switch to tenant schema
                await client.query(`SET search_path TO "${tenant.db_name}"`);
                const users = await client.query('SELECT id, name, email, role, status FROM users');
                console.table(users.rows);
            } catch (err) {
                console.log(`Error querying tenant ${tenant.name}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.query('SET search_path TO public');
        client.release();
        await pool.end();
    }
}

debugUsers();
