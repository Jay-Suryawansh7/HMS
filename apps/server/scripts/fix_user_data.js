const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hms_master',
    password: 'postgrespassword',
    port: 5432,
});

async function fixUserData() {
    const client = await pool.connect();
    try {
        // Get tenant db_name for test2
        const tenantResult = await client.query("SELECT db_name FROM tenants WHERE subdomain = 'test2'");
        if (tenantResult.rows.length === 0) {
            console.log('Tenant test2 not found');
            return;
        }
        const dbName = tenantResult.rows[0].db_name;
        console.log(`Found tenant db: ${dbName}`);

        // Switch to tenant schema
        await client.query(`SET search_path TO "${dbName}"`);

        // Update user
        const updateResult = await client.query(`
            UPDATE users 
            SET email = 'admin2@test.com', name = 'Admin Two' 
            WHERE email = 'test2admin2@test.com'
            RETURNING *
        `);

        console.log('Updated user:', updateResult.rows[0]);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.query('SET search_path TO public');
        client.release();
        await pool.end();
    }
}

fixUserData();
