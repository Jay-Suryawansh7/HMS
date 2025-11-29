const { pool } = require('../src/config/dbConfigPg');
require('dotenv').config();

/**
 * Migration script to add prescriptions and prescription_items tables
 * to all existing tenant databases
 */

async function migratePrescriptions() {
    const client = await pool.connect();

    try {
        console.log('Starting prescription tables migration...');

        // Get all tenant databases from public schema
        await client.query('SET search_path TO public');
        const tenantsResult = await client.query('SELECT db_name FROM tenants');
        const tenants = tenantsResult.rows;

        console.log(`Found ${tenants.length} tenant(s) to migrate`);

        for (const tenant of tenants) {
            const dbName = tenant.db_name;
            console.log(`\nMigrating tenant: ${dbName}`);

            try {
                // Switch to tenant schema
                await client.query(`SET search_path TO "${dbName}"`);

                // Check if prescriptions table already exists
                const checkPrescriptionsTable = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = '${dbName}'
                        AND table_name = 'prescriptions'
                    );
                `);

                if (checkPrescriptionsTable.rows[0].exists) {
                    console.log(`  ✓ prescriptions table already exists, skipping...`);
                } else {
                    // Create prescriptions table
                    await client.query(`
                        CREATE TABLE prescriptions (
                            id SERIAL PRIMARY KEY,
                            prescription_id VARCHAR(50) NOT NULL UNIQUE,
                            doctor_id INTEGER NOT NULL REFERENCES users(id),
                            patient_id INTEGER NOT NULL REFERENCES patients(id),
                            notes TEXT,
                            created_at TIMESTAMP DEFAULT NOW()
                        );
                    `);
                    console.log(`  ✓ Created prescriptions table`);

                    // Create indexes
                    await client.query(`
                        CREATE INDEX prescription_id_idx ON prescriptions(prescription_id);
                    `);
                    await client.query(`
                        CREATE INDEX prescription_doctor_id_idx ON prescriptions(doctor_id);
                    `);
                    await client.query(`
                        CREATE INDEX prescription_patient_id_idx ON prescriptions(patient_id);
                    `);
                    console.log(`  ✓ Created indexes for prescriptions table`);
                }

                // Check if prescription_items table already exists
                const checkItemsTable = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = '${dbName}'
                        AND table_name = 'prescription_items'
                    );
                `);

                if (checkItemsTable.rows[0].exists) {
                    console.log(`  ✓ prescription_items table already exists, skipping...`);
                } else {
                    // Create prescription_items table
                    await client.query(`
                        CREATE TABLE prescription_items (
                            id SERIAL PRIMARY KEY,
                            prescription_id INTEGER NOT NULL REFERENCES prescriptions(id),
                            medicine_name VARCHAR(255) NOT NULL,
                            dosage VARCHAR(100) NOT NULL,
                            frequency VARCHAR(100) NOT NULL,
                            duration VARCHAR(100) NOT NULL,
                            instructions TEXT
                        );
                    `);
                    console.log(`  ✓ Created prescription_items table`);

                    // Create index
                    await client.query(`
                        CREATE INDEX prescription_item_prescription_id_idx ON prescription_items(prescription_id);
                    `);
                    console.log(`  ✓ Created index for prescription_items table`);
                }

                console.log(`  ✅ Migration completed for ${dbName}`);

            } catch (error) {
                console.error(`  ❌ Error migrating tenant ${dbName}:`, error.message);
                // Continue with other tenants
            }
        }

        console.log('\n✅ All tenant migrations completed!');

    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    } finally {
        await client.query('SET search_path TO public');
        client.release();
        await pool.end();
    }
}

// Run migration
migratePrescriptions()
    .then(() => {
        console.log('Migration script finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
