const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');
// Import redis client to ensure connection starts
require('./config/redisClient');

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
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/patients', require('./routes/patientsRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionsRoutes'));
app.use('/api/platform', require('./routes/platformAdminRoutes'));
app.use('/api', require('./routes/onboardingRoutes'));

app.get('/', (req, res) => {
    res.send('HMS API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
