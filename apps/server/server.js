const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./src/routes/authRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const appointmentsRoutes = require('./src/routes/appointmentsRoutes');
// Import redis client to ensure connection starts
require('./src/config/redisClient');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.NODE_ENV === 'development' ? '*' : process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api/patients', require('./src/routes/patientsRoutes'));
app.use('/api/prescriptions', require('./src/routes/prescriptionsRoutes'));
app.use('/api/platform', require('./src/routes/platformAdminRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api', require('./src/routes/onboardingRoutes'));


app.get('/', (req, res) => {
    res.send('HMS API is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
