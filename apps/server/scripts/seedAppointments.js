require('dotenv').config();
const dbManager = require('../src/db/dbManager');

async function seedPatientsAndAppointments() {
    try {
        // Connect to cityhospital tenant database
        const tenantDb = 'hms_tenant_cityhospital_071b5f98';

        console.log('Connecting to tenant database:', tenantDb);
        const pool = await dbManager.getTenantConnection(tenantDb);

        // Create sample patients
        const samplePatients = [
            { name: 'John Smith', dob: '1985-05-15', history: 'No significant medical history', type: 'OPD' },
            { name: 'Sarah Johnson', dob: '1990-08-22', history: 'Asthma, controlled with medication', type: 'OPD' },
            { name: 'Michael Brown', dob: '1978-03-10', history: 'Hypertension', type: 'OPD' },
            { name: 'Emily Davis', dob: '1995-11-30', history: 'Allergies to penicillin', type: 'OPD' },
            { name: 'David Wilson', dob: '1982-07-18', history: 'Diabetes Type 2', type: 'IPD' },
            { name: 'Lisa Anderson', dob: '1988-12-05', history: 'No significant medical history', type: 'OPD' },
            { name: 'James Martinez', dob: '1975-09-25', history: 'Previous heart surgery (2015)', type: 'IPD' },
            { name: 'Jennifer Taylor', dob: '1992-04-14', history: 'Migraine disorder', type: 'OPD' },
            { name: 'Robert Thompson', dob: '1980-06-08', history: 'Thyroid disorder', type: 'OPD' },
            { name: 'Maria Garcia', dob: '1987-01-20', history: 'No significant medical history', type: 'OPD' }
        ];

        console.log('\n📋 Creating sample patients...');
        const patientIds = [];
        for (const patient of samplePatients) {
            const [result] = await pool.query(
                'INSERT INTO patients (name, dob, history, type) VALUES (?, ?, ?, ?)',
                [patient.name, patient.dob, patient.history, patient.type]
            );
            patientIds.push(result.insertId);
            console.log(`  ✓ Created patient: ${patient.name}`);
        }

        // Get doctors
        const [users] = await pool.query('SELECT id, name, role FROM users WHERE role IN ("DOCTOR", "ADMIN") LIMIT 5');
        if (users.length === 0) {
            console.log('\n❌ No doctors found. Please create users first using seedUser.js');
            return;
        }

        console.log(`\n👨‍⚕️ Found ${users.length} doctors`);

        // Create sample appointments
        const appointments = [
            {
                doctor_id: users[0].id,
                patient_id: patientIds[0],
                time: new Date(2025, 10, 29, 9, 0), // Nov 29, 2025, 9:00 AM
                status: 'SCHEDULED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[1],
                time: new Date(2025, 10, 29, 10, 30), // Nov 29, 2025, 10:30 AM
                status: 'SCHEDULED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[2],
                time: new Date(2025, 10, 29, 14, 0), // Nov 29, 2025, 2:00 PM
                status: 'SCHEDULED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[3],
                time: new Date(2025, 10, 28, 9, 0), // Nov 28, 2025, 9:00 AM
                status: 'COMPLETED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[4],
                time: new Date(2025, 10, 28, 11, 0), // Nov 28, 2025, 11:00 AM
                status: 'COMPLETED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[5],
                time: new Date(2025, 10, 27, 15, 30), // Nov 27, 2025, 3:30 PM
                status: 'CANCELLED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[6],
                time: new Date(2025, 10, 30, 9, 30), // Nov 30, 2025, 9:30 AM
                status: 'SCHEDULED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[7],
                time: new Date(2025, 10, 30, 11, 0), // Nov 30, 2025, 11:00 AM
                status: 'SCHEDULED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[8],
                time: new Date(2025, 10, 30, 13, 30), // Nov 30, 2025, 1:30 PM
                status: 'SCHEDULED'
            },
            {
                doctor_id: users[0].id,
                patient_id: patientIds[9],
                time: new Date(2025, 11, 1, 10, 0), // Dec 1, 2025, 10:00 AM
                status: 'SCHEDULED'
            }
        ];

        console.log('\n📅 Creating appointments...');
        for (const apt of appointments) {
            await pool.query(
                'INSERT INTO appointments (doctor_id, patient_id, time, status) VALUES (?, ?, ?, ?)',
                [apt.doctor_id, apt.patient_id, apt.time, apt.status]
            );
            console.log(`  ✓ Created ${apt.status} appointment on ${apt.time.toLocaleString()}`);
        }

        console.log('\n✅ Successfully seeded patients and appointments!');
        console.log(`\nSummary:`);
        console.log(`  Patients created: ${samplePatients.length}`);
        console.log(`  Appointments created: ${appointments.length}`);

        // Display appointments summary by status
        const [summary] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM appointments 
            GROUP BY status
        `);
        console.log('\nAppointments by status:');
        summary.forEach(row => {
            console.log(`  ${row.status}: ${row.count}`);
        });

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        process.exit();
    }
}

seedPatientsAndAppointments();
