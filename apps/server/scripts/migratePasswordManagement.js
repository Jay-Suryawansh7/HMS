const { pool } = require('../src/config/dbConfigPg');
require('dotenv').config();

/**
 * Migration script to add password management tables and columns
 * to all existing tenant databases
 */

async function migratePasswordManagement() {
    const client = await pool.connect();

    try {
        console.log('Starting password management migration...');

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

                // Add new columns to users table if they don't exist
                console.log(`  Checking users table columns...`);

                const checkForcePasswordChange = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = '${dbName}' 
                    AND table_name = 'users' 
                    AND column_name = 'force_password_change';
                `);

                if (checkForcePasswordChange.rows.length === 0) {
                    await client.query(`
                        ALTER TABLE users 
                        ADD COLUMN force_password_change VARCHAR(10) DEFAULT 'false';
                    `);
                    console.log(`  ✓ Added force_password_change column to users`);
                } else {
                    console.log(`  ✓ force_password_change column already exists`);
                }

                const checkPasswordLastChanged = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = '${dbName}' 
                    AND table_name = 'users' 
                    AND column_name = 'password_last_changed';
                `);

                if (checkPasswordLastChanged.rows.length === 0) {
                    await client.query(`
                        ALTER TABLE users 
                        ADD COLUMN password_last_changed TIMESTAMP;
                    `);
                    console.log(`  ✓ Added password_last_changed column to users`);
                } else {
                    console.log(`  ✓ password_last_changed column already exists`);
                }

                // Check if password_reset_tokens table exists
                const checkResetTokensTable = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = '${dbName}'
                        AND table_name = 'password_reset_tokens'
                    );
                `);

                if (!checkResetTokensTable.rows[0].exists) {
                    await client.query(`
                        CREATE TABLE password_reset_tokens (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER NOT NULL REFERENCES users(id),
                            token VARCHAR(255) NOT NULL,
                            expires_at TIMESTAMP NOT NULL,
                            used VARCHAR(10) DEFAULT 'false',
                            created_at TIMESTAMP DEFAULT NOW()
                        );
                    `);
                    console.log(`  ✓ Created password_reset_tokens table`);

                    await client.query(`
                        CREATE INDEX password_reset_token_idx ON password_reset_tokens(token);
                    `);
                    await client.query(`
                        CREATE INDEX password_reset_user_id_idx ON password_reset_tokens(user_id);
                    `);
                    console.log(`  ✓ Created indexes for password_reset_tokens`);
                } else {
                    console.log(`  ✓ password_reset_tokens table already exists`);
                }

                // Check if password_history table exists
                const checkPasswordHistoryTable = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = '${dbName}'
                        AND table_name = 'password_history'
                    );
                `);

                if (!checkPasswordHistoryTable.rows[0].exists) {
                    await client.query(`
                        CREATE TABLE password_history (
                            id SERIAL PRIMARY KEY,
                            user_id INTEGER NOT NULL REFERENCES users(id),
                            password_hash VARCHAR(255) NOT NULL,
                            created_at TIMESTAMP DEFAULT NOW()
                        );
                    `);
                    console.log(`  ✓ Created password_history table`);

                    await client.query(`
                        CREATE INDEX password_history_user_id_idx ON password_history(user_id);
                    `);
                    console.log(`  ✓ Created index for password_history`);
                } else {
                    console.log(`  ✓ password_history table already exists`);
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
migratePasswordManagement()
    .then(() => {
        console.log('Migration script finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
