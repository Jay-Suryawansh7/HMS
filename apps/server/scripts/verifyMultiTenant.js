const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function verifyMultiTenant() {
    try {
        const timestamp = Date.now();
        const hospitalData = {
            hospitalName: `Test Hospital ${timestamp}`,
            subdomain: `test${timestamp}`,
            licenseKey: `LICENSE-${timestamp}`,
            adminEmail: `admin${timestamp}@test.com`,
            adminPassword: 'password123',
            address: '123 Test St',
            contact: '555-0123'
        };

        console.log('1. Onboarding Hospital...');
        const onboardRes = await axios.post(`${API_URL}/onboard-hospital`, hospitalData);
        console.log('Onboarding Success:', onboardRes.data);

        console.log('\n2. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: hospitalData.adminEmail,
            password: hospitalData.adminPassword,
            hospitalId: hospitalData.subdomain
        });
        console.log('Login Success. Token received.');
        const token = loginRes.data.tokens.accessToken;

        console.log('\n3. Adding Staff Member...');
        const staffData = {
            name: 'Nurse Joy',
            email: `nurse${timestamp}@test.com`,
            role: 'NURSE',
            password: 'nursepassword123'
        };
        const addStaffRes = await axios.post(`${API_URL}/staff/add`, staffData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Add Staff Success:', addStaffRes.data);

        console.log('\n4. Fetching Staff List...');
        const getStaffRes = await axios.get(`${API_URL}/staff`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Staff List:', getStaffRes.data);

        if (getStaffRes.data.staff.length > 0) {
            console.log('✅ Staff verification passed');
        } else {
            console.error('❌ Staff verification failed: List empty');
        }

        console.log('\n5. Fetching Appointments...');
        const getAppointmentsRes = await axios.get(`${API_URL}/appointments`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Appointments List:', getAppointmentsRes.data);

        console.log('\n✅ Multi-Tenant Verification Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyMultiTenant();
