const dbManager = require('../src/db/dbManager');

async function testCreateTenant() {
    try {
        console.log('Starting tenant creation test...');
        const result = await dbManager.createTenant(
            'City Hospital',
            'cityhospital',
            'LICENSE-123-TEST'
        );
        console.log('Tenant created successfully:', result);
        process.exit(0);
    } catch (error) {
        console.error('Tenant creation failed:', error);
        process.exit(1);
    }
}

testCreateTenant();
