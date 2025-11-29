const { pool } = require('../src/config/dbConfigPg');

/**
 * Migration script to update patients table schema
 * Run this once to add new fields to existing patients table
 */

async function migratePatients() {
    const client = await pool.connect();

    try {
        console.log('Starting patients table migration...');

        // Get all tenant schemas
        const tenantsResult = await client.query(`
            SELECT db_name FROM tenants WHERE status IN ('ACTIVE', 'VERIFIED')
        `);

        console.log(`Found ${tenantsResult.rows.length} tenant(s) to migrate`);

        for (const tenant of tenantsResult.rows) {
            const dbName = tenant.db_name;
            console.log(`\nMigrating schema: ${dbName}`);

            try {
                await client.query(`SET search_path TO "${dbName}"`);

                // Check if patients table exists
                const tableExists = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = '${dbName}'
                        AND table_name = 'patients'
                    )
                `);

                if (!tableExists.rows[0].exists) {
                    console.log(`  - Creating patients table from scratch...`);

                    // Create gender enum if it doesn't exist
                    await client.query(`
                        DO $$ BEGIN
                            CREATE TYPE gender AS ENUM ('Male', 'Female', 'Other');
                        EXCEPTION
                            WHEN duplicate_object THEN null;
                        END $$;
                    `);

                    // Create the full table
                    await client.query(`
                        CREATE TABLE IF NOT EXISTS patients (
                            id SERIAL PRIMARY KEY,
                            patient_id VARCHAR(50) NOT NULL UNIQUE,
                            first_name VARCHAR(100) NOT NULL,
                            last_name VARCHAR(100) NOT NULL,
                            dob TIMESTAMP,
                            gender gender,
                            blood_group VARCHAR(10),
                            phone VARCHAR(20) NOT NULL,
                            email VARCHAR(255),
                            address TEXT,
                            emergency_contact_name VARCHAR(100),
                            emergency_contact_phone VARCHAR(20),
                            patient_type patient_type NOT NULL,
                            photo_url VARCHAR(500),
                            history TEXT,
                            created_at TIMESTAMP DEFAULT NOW(),
                            updated_at TIMESTAMP DEFAULT NOW()
                        );
                    `);

                    // Create indexes
                    await client.query(`
                        CREATE INDEX IF NOT EXISTS patient_id_idx ON patients(patient_id);
                        CREATE INDEX IF NOT EXISTS phone_idx ON patients(phone);
                        CREATE INDEX IF NOT EXISTS email_idx ON patients(email);
                        CREATE INDEX IF NOT EXISTS patient_type_idx ON patients(patient_type);
                    `);

                    console.log('  ✓ Created patients table with all fields');
                } else {
                    console.log(`  - Updating existing patients table...`);

                    // Create gender enum if it doesn't exist
                    await client.query(`
                        DO $$ BEGIN
                            CREATE TYPE gender AS ENUM ('Male', 'Female', 'Other');
                        EXCEPTION
                            WHEN duplicate_object THEN null;
                        END $$;
                    `);

                    // Add new columns if they don't exist
                    const alterQueries = [
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_id VARCHAR(50)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS gender gender`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(255)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_type patient_type`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500)`,
                        `ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,
                    ];

                    for (const query of alterQueries) {
                        try {
                            await client.query(query);
                        } catch (err) {
                            // Column might already exist, ignore
                        }
                    }

                    // Migrate old 'name' field to first_name/last_name if needed
                    await client.query(`
                        DO $$ 
                        BEGIN
                            IF EXISTS (SELECT 1 FROM information_schema.columns 
                                      WHERE table_name='patients' AND column_name='name') THEN
                                UPDATE patients 
                                SET first_name = COALESCE(first_name, SPLIT_PART(name, ' ', 1)),
                                    last_name = COALESCE(last_name, SPLIT_PART(name, ' ', 2))
                                WHERE first_name IS NULL OR last_name IS NULL;
                            END IF;
                        END $$;
                    `);

                    // Migrate old 'type' field to patient_type if needed
                    await client.query(`
                        DO $$ 
                        BEGIN
                            IF EXISTS (SELECT 1 FROM information_schema.columns 
                                      WHERE table_name='patients' AND column_name='type') THEN
                                UPDATE patients 
                                SET patient_type = COALESCE(patient_type, type::text::patient_type)
                                WHERE patient_type IS NULL;
                            END IF;
                        END $$;
                    `);

                    // Drop old 'name' column if it exists
                    await client.query(`
                        ALTER TABLE patients DROP COLUMN IF EXISTS name;
                    `);

                    // Drop old 'type' column if it exists
                    await client.query(`
                        ALTER TABLE patients DROP COLUMN IF EXISTS type;
                    `);

                    // Add unique constraint to patient_id
                    await client.query(`
                        DO $$ 
                        BEGIN
                            ALTER TABLE patients ADD CONSTRAINT patients_patient_id_unique UNIQUE (patient_id);
                        EXCEPTION
                            WHEN duplicate_table THEN null;
                        END $$;
                    `);

                    // Create indexes
                    await client.query(`
                        CREATE INDEX IF NOT EXISTS patient_id_idx ON patients(patient_id);
                        CREATE INDEX IF NOT EXISTS phone_idx ON patients(phone);
                        CREATE INDEX IF NOT EXISTS email_idx ON patients(email);
                        CREATE INDEX IF NOT EXISTS patient_type_idx ON patients(patient_type);
                    `);

                    console.log('  ✓ Updated patients table schema');
                }

                // Reset search path
                await client.query('SET search_path TO public');

            } catch (error) {
                console.error(`  ✗ Error migrating ${dbName}:`, error.message);
            }
        }

        console.log('\n✓ Migration completed!');

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run migration
migratePatients()
    .then(() => {
        console.log('Migration script finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
