const { pool } = require('../config/dbConfigPg');
const { tenants } = require('../db/publicSchema');
const { users } = require('../db/tenantSchema');
const { eq } = require('drizzle-orm');
const { drizzle } = require('drizzle-orm/node-postgres');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = drizzle(pool);

class TenantService {
    async onboardHospital(data) {
        const { hospitalName, subdomain, licenseKey, adminEmail, adminName, adminPassword, address, contact } = data;

        // 1. Validate License (Mock)
        if (!licenseKey) {
            throw new Error('License key is required');
        }

        // Check if subdomain exists
        const existingTenant = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
        if (existingTenant.length > 0) {
            throw new Error('Subdomain already taken');
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 2. Create Tenant Record
            const tenantId = uuidv4();
            const dbName = `tenant_${tenantId.replace(/-/g, '_')}`; // Safe schema name

            await db.insert(tenants).values({
                id: tenantId,
                hospitalName,
                subdomain,
                dbName,
                licenseKey,
                status: 'PENDING', // Default status
                adminEmail,
                address,
                contact
            });

            // 3. Schema Provisioning
            console.log(`Creating schema: ${dbName}`);
            await client.query(`CREATE SCHEMA "${dbName}"`);

            // 4. Run Migrations (Create Tables)
            // Read the template SQL
            const sqlPath = path.join(__dirname, '../db/tenantTemplate.sql');
            const sql = fs.readFileSync(sqlPath, 'utf8');

            // Set search path to the new schema and run SQL
            await client.query(`SET search_path TO "${dbName}"`);
            await client.query(sql);

            // 5. Create Admin User
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // We can use Drizzle to insert, but we need to configure it to use the new schema?
            // Or just use raw SQL for simplicity in this transaction context with search_path set.
            // Using raw SQL is safer here as Drizzle instance is bound to default search path usually.

            await client.query(`
                INSERT INTO "users" (email, password, role, name, status)
                VALUES ($1, $2, 'ADMIN', $3, 'ACTIVE')
            `, [adminEmail, hashedPassword, adminName || 'Admin']);

            // 6. Update Tenant Status to VERIFIED (Mocking the flow)
            // Reset search path to public to update tenant status
            await client.query(`SET search_path TO public`);
            await db.update(tenants)
                .set({ status: 'VERIFIED' })
                .where(eq(tenants.id, tenantId));

            await client.query('COMMIT');

            // 7. Notification (Mock)
            console.log(`Verification email sent to ${adminEmail}`);

            return {
                success: true,
                tenantId,
                subdomain,
                message: 'Hospital onboarded successfully'
            };

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Onboarding error:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new TenantService();
