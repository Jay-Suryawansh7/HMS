const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function verifyRBAC() {
    try {
        const timestamp = Date.now();
        const hospitalData = {
            hospitalName: `RBAC Test Hospital ${timestamp}`,
            subdomain: `rbac${timestamp}`,
            licenseKey: `LICENSE-${timestamp}`,
            adminEmail: `admin${timestamp}@rbac.com`,
            adminPassword: 'password123',
            address: '123 RBAC St',
            contact: '555-RBAC'
        };

        console.log('1. Onboarding Hospital...');
        const onboardRes = await axios.post(`${API_URL}/onboard-hospital`, hospitalData);
        console.log('Onboarding Success:', onboardRes.data);

        console.log('\n2. Logging in as Admin...');
        const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: hospitalData.adminEmail,
            password: hospitalData.adminPassword,
            hospitalId: hospitalData.subdomain
        });
        const adminToken = adminLoginRes.data.tokens.accessToken;
        console.log('Admin Login Success.');

        console.log('\n3. Admin Adding Doctor...');
        const doctorEmail = `doctor${timestamp}@rbac.com`;
        const doctorData = {
            name: 'Dr. House',
            email: doctorEmail,
            role: 'DOCTOR',
            password: 'password123'
        };
        const addDoctorRes = await axios.post(`${API_URL}/staff/add`, doctorData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const doctorId = addDoctorRes.data.staffId;
        console.log('Admin added Doctor Success:', addDoctorRes.data);

        console.log('\n4. Admin Adding Nurse...');
        const nurseEmail = `nurse${timestamp}@rbac.com`;
        const nurseData = {
            name: 'Nurse Joy',
            email: nurseEmail,
            role: 'NURSE',
            password: 'password123'
        };
        const addNurseRes = await axios.post(`${API_URL}/staff/add`, nurseData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const nurseId = addNurseRes.data.staffId;
        console.log('Admin added Nurse Success:', addNurseRes.data);

        console.log('\n5. Logging in as Doctor...');
        const doctorLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: doctorEmail,
            password: 'password123',
            hospitalId: hospitalData.subdomain
        });
        const doctorToken = doctorLoginRes.data.tokens.accessToken;
        console.log('Doctor Login Success.');

        console.log('\n6. Doctor trying to add Staff (Should Fail)...');
        try {
            await axios.post(`${API_URL}/staff/add`, {
                name: 'Hacker',
                email: `hacker${timestamp}@rbac.com`,
                role: 'ADMIN',
                password: 'password123'
            }, {
                headers: { Authorization: `Bearer ${doctorToken}` }
            });
            console.error('❌ Doctor was able to add staff! RBAC FAILED.');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ Doctor denied adding staff (403 Forbidden).');
            } else {
                console.error('❌ Unexpected error:', error.message);
            }
        }

        console.log('\n7. Doctor Assigning Task to Nurse...');
        const taskData = {
            title: 'Check Vitals',
            description: 'Patient in Room 101',
            assignedTo: nurseId
        };
        const assignTaskRes = await axios.post(`${API_URL}/tasks/assign`, taskData, {
            headers: { Authorization: `Bearer ${doctorToken}` }
        });
        console.log('Doctor assigned task Success:', assignTaskRes.data);

        console.log('\n8. Logging in as Nurse...');
        const nurseLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: nurseEmail,
            password: 'password123',
            hospitalId: hospitalData.subdomain
        });
        const nurseToken = nurseLoginRes.data.tokens.accessToken;
        console.log('Nurse Login Success.');

        console.log('\n9. Nurse Checking Tasks...');
        const getTasksRes = await axios.get(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${nurseToken}` }
        });
        console.log('Nurse Tasks:', getTasksRes.data);

        if (getTasksRes.data.tasks.length > 0 && getTasksRes.data.tasks[0].title === 'Check Vitals') {
            console.log('✅ Task verification passed');
        } else {
            console.error('❌ Task verification failed');
        }

        console.log('\n✅ RBAC Verification Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyRBAC();
