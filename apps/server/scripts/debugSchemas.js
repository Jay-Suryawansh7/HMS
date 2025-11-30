const { pool } = require('../src/config/dbConfigPg');

async function debugSchemas() {
    const client = await pool.connect();
    try {
        console.log('Checking tenant schemas...');

        // Get ALL tenants regardless of status
        const tenants = await client.query('SELECT id, db_name, status FROM tenants');
        console.log(`Found ${tenants.rows.length} total tenants.`);

        for (const tenant of tenants.rows) {
            const dbName = tenant.db_name;
            console.log(`\nChecking schema: ${dbName} (Status: ${tenant.status})`);

            try {
                await client.query(`SET search_path TO "${dbName}"`);

                // Check columns in patients table
                const columns = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = '${dbName}' 
                    AND table_name = 'patients'
                `);

                const columnNames = columns.rows.map(r => r.column_name);
                console.log('  Columns:', columnNames.join(', '));

                if (columnNames.includes('patient_id')) {
                    console.log('  ✅ patient_id column exists');
                } else {
                    console.log('  ❌ patient_id column MISSING');
                }

            } catch (err) {
                console.log(`  ❌ Error checking schema: ${err.message}`);
            }
        }
    } catch (err) {
        console.error('Script error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

debugSchemas();
