const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dbManager = require('../src/db/dbManager');
require('dotenv').config();

async function seedUser() {
    try {
        const commonPool = await dbManager.getCommonConnection();
        const [tenants] = await commonPool.query('SELECT * FROM tenants WHERE subdomain = ?', ['cityhospital']);

        if (tenants.length === 0) {
            console.error('Tenant cityhospital not found');
            process.exit(1);
        }

        const tenant = tenants[0];
        console.log(`Found tenant: ${tenant.hospital_name} (${tenant.db_name})`);

        const tenantPool = await dbManager.getTenantConnection(tenant.db_name);

        const hashedPassword = await bcrypt.hash('password123', 10);

        await tenantPool.query(`
      INSERT INTO users (email, password, role, name)
      VALUES (?, ?, ?, ?)
    `, ['admin@cityhospital.com', hashedPassword, 'ADMIN', 'Admin User']);

        console.log('User seeded successfully');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
}

seedUser();
