require('dotenv').config();
const { pool } = require('../src/config/dbConfigPg');

const migratePrescriptions = async () => {
    const client = await pool.connect();

    try {
        console.log('Starting prescriptions table migration...');

        // Get all tenant schemas
        const tenantsResult = await client.query(`
            SELECT db_name FROM tenants
        `);

        console.log(`Found ${tenantsResult.rows.length} tenant(s) to migrate`);

        for (const tenant of tenantsResult.rows) {
            const schemaName = tenant.db_name;
            console.log(`\nMigrating schema: ${schemaName}`);

            try {
                // Set search path to tenant schema
                await client.query(`SET search_path TO "${schemaName}"`);

                // Create prescriptions table
                await client.query(`
                    CREATE TABLE IF NOT EXISTS "prescriptions" (
                        "id" serial PRIMARY KEY NOT NULL,
                        "prescription_id" varchar(50) NOT NULL UNIQUE,
                        "doctor_id" integer NOT NULL,
                        "patient_id" integer NOT NULL,
                        "notes" text,
                        "created_at" timestamp DEFAULT now(),
                        CONSTRAINT "prescriptions_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
                        CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action
                    );
                `);
                console.log('  ✓ Created/Verified prescriptions table');

                // Create prescription_items table
                await client.query(`
                    CREATE TABLE IF NOT EXISTS "prescription_items" (
                        "id" serial PRIMARY KEY NOT NULL,
                        "prescription_id" integer NOT NULL,
                        "medicine_name" varchar(255) NOT NULL,
                        "dosage" varchar(100) NOT NULL,
                        "frequency" varchar(100) NOT NULL,
                        "duration" varchar(100) NOT NULL,
                        "instructions" text,
                        CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE no action
                    );
                `);
                console.log('  ✓ Created/Verified prescription_items table');

            } catch (err) {
                console.error(`  ✗ Error migrating ${schemaName}:`, err.message);
            }
        }

        console.log('\n✓ Migration completed!');

    } catch (error) {
        console.error('Migration script failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

migratePrescriptions();
