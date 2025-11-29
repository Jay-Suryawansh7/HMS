const axios = require('axios');
const { Client } = require('pg');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api/onboard-hospital';

const testData = {
    hospitalName: 'Test Hospital',
    subdomain: 'testhospital',
    licenseKey: 'LICENSE-12345',
    adminEmail: 'admin@testhospital.com',
    adminPassword: 'password123',
    address: '123 Test St',
    contact: '555-0123'
};

async function testOnboarding() {
    console.log('🚀 Starting Onboarding Test...');

    try {
        // 1. Call API
        console.log('Sending request to API...');
        const response = await axios.post(API_URL, testData);
        console.log('✅ API Response:', response.data);

        if (!response.data.success) {
            throw new Error('API returned failure');
        }

        const { tenantId } = response.data;
        const expectedDbName = `tenant_${tenantId.replace(/-/g, '_')}`;

        // 2. Verify Database
        console.log(`\n🔍 Verifying Database Schema: ${expectedDbName}`);

        const client = new Client({
            host: process.env.PG_HOST,
            port: Number(process.env.PG_PORT),
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
        });

        await client.connect();

        // Check if schema exists
        const schemaRes = await client.query(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name = $1
        `, [expectedDbName]);

        if (schemaRes.rows.length > 0) {
            console.log('✅ Schema exists!');
        } else {
            console.error('❌ Schema NOT found!');
        }

        // Check if users table exists in the new schema
        const tableRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = 'users'
        `, [expectedDbName]);

        if (tableRes.rows.length > 0) {
            console.log('✅ Users table exists in tenant schema!');
        } else {
            console.error('❌ Users table NOT found in tenant schema!');
        }

        // Check if admin user exists
        // We need to set search path or qualify the table
        const userRes = await client.query(`
            SELECT email, role FROM "${expectedDbName}"."users" WHERE email = $1
        `, [testData.adminEmail]);

        if (userRes.rows.length > 0) {
            console.log('✅ Admin user created:', userRes.rows[0]);
        } else {
            console.error('❌ Admin user NOT found!');
        }

        await client.end();

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

testOnboarding();
