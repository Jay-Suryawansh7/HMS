# HMS Server (Backend API)

The backend REST API for the Hospital Management System. Built with Node.js and Express, this server provides multi-tenant support, authentication, and all business logic for hospital operations.

## 🎯 Overview

A robust, scalable backend API featuring:
- Multi-tenant architecture (schema-per-tenant)
- JWT-based authentication
- Role-based access control (RBAC)
- PostgreSQL database
- RESTful API design

## 🏗️ Architecture

### Technology Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Zod**: Request validation
- **Drizzle Kit**: Database migrations
- **Redis**: Caching (optional)
- **Multer**: File uploads

### Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── dbConfigPg.js       # PostgreSQL configuration
│   │   └── multerConfig.js     # File upload config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientsController.js
│   │   ├── appointmentsController.js
│   │   ├── prescriptionsController.js
│   │   ├── staffController.js
│   │   └── platformAdminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── upload.js           # File upload middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientsRoutes.js
│   │   ├── appointmentsRoutes.js
│   │   ├── prescriptionsRoutes.js
│   │   ├── staffRoutes.js
│   │   └── platformAdminRoutes.js
│   ├── services/
│   │   ├── patientIdService.js
│   │   └── prescriptionIdService.js
│   ├── db/
│   │   └── tenantTemplate.sql  # Tenant schema template
│   └── scripts/
│       ├── migratePatients.js
│       ├── migratePrescriptions.js
│       └── debugSchemas.js
├── server.js                    # Entry point
├── .env                         # Environment variables
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Installation

```bash
# Navigate to server directory
cd apps/server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hms_db
PG_SSL=false

# JWT Secrets (use strong random strings in production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production

# Redis (optional)
REDIS_URL=redis://localhost:6379

# CORS
CLIENT_URL=http://localhost:5173
SUPER_ADMIN_URL=http://localhost:5174
```

### Database Setup

1. **Create Database**
```sql
CREATE DATABASE hms_db;
```

2. **Run Migrations**
```bash
npm run db:migrate
```

3. **Create Platform Admin Schema**
The public schema will be created automatically with:
- `tenants` table
- `platform_admins` table

### Development

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:5001`

## 🗄️ Database Architecture

### Multi-Tenant Design

**Public Schema** (Shared)
```sql
-- Tenants table
tenants (
  id, hospital_name, subdomain, license_number,
  admin_name, admin_email, contact_number,
  address, city, state, pincode,
  status, db_name, created_at
)

-- Platform admins table
platform_admins (
  id, name, email, password, role, created_at
)
```

**Tenant Schema** (Per Hospital)
Each tenant gets its own schema: `tenant_{uuid}`

```sql
-- Users (staff members)
users (
  id, name, email, password, role, status,
  force_password_change, created_at
)

-- Patients
patients (
  id, patient_id, first_name, last_name,
  phone, email, dob, gender, blood_group,
  address, emergency_contact_name,
  emergency_contact_phone, patient_type,
  photo_url, history, admission_notes,
  created_at, updated_at
)

-- Appointments
appointments (
  id, doctor_id, patient_id,
  time, status
)

-- Prescriptions
prescriptions (
  id, prescription_id, doctor_id,
  patient_id, notes, created_at
)

-- Prescription Items
prescription_items (
  id, prescription_id, medicine_name,
  dosage, frequency, duration, instructions
)

-- Tasks
tasks (
  id, title, description,
  assigned_to, assigned_by,
  status, created_at
)
```

### Schema Isolation

Each API request:
1. Authenticates user (JWT)
2. Determines tenant from token
3. Sets PostgreSQL search_path to tenant schema
4. Executes query in isolated schema
5. Resets to public schema

```javascript
// Example from controller
await client.query(`SET search_path TO "${tenantDbName}"`);
// ... execute queries
await client.query('SET search_path TO public');
```

## 📡 API Endpoints

### Authentication

**POST /api/auth/signup**
Register new hospital
```json
{
  "hospitalName": "City Hospital",
  "subdomain": "cityhospital",
  "licenseNumber": "LIC123",
  "adminName": "John Doe",
  "adminEmail": "admin@cityhospital.com",
  "password": "SecurePass123",
  "contactNumber": "1234567890",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**POST /api/auth/login**
User login
```json
{
  "email": "admin@cityhospital.com",
  "password": "SecurePass123",
  "hospitalId": "cityhospital"
}
```
Response:
```json
{
  "user": {
    "id": 1,
    "email": "admin@cityhospital.com",
    "name": "John Doe",
    "role": "ADMIN",
    "tenantId": 5,
    "hospitalName": "City Hospital"
  },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**POST /api/auth/refresh**
Refresh access token
```json
{
  "refreshToken": "eyJ..."
}
```

### Patients

**GET /api/patients**
List all patients (supports pagination)
```
Query params: ?page=1&limit=20
Headers: 
  Authorization: Bearer {token}
  x-tenant-id: {tenantId}
```

**POST /api/patients**
Register new patient
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "9876543210",
  "email": "jane@example.com",
  "dob": "1990-05-15",
  "gender": "Female",
  "bloodGroup": "O+",
  "address": "456 Park Ave",
  "emergencyContactName": "John Smith",
  "emergencyContactPhone": "9876543211",
  "patientType": "OPD",
  "history": "No major history"
}
```

**GET /api/patients/:id**
Get patient details

**PUT /api/patients/:id**
Update patient information

**GET /api/patients/export**
Export patients to CSV

### Appointments

**GET /api/appointments**
List all appointments
```
Headers:
  Authorization: Bearer {token}
  x-tenant-id: {tenantId}
```
Response:
```json
{
  "success": true,
  "appointments": [
    {
      "id": 1,
      "doctor_id": 2,
      "patient_id": 5,
      "patient_name": "Jane Smith",
      "doctor_name": "Dr. John Doe",
      "time": "2025-11-30T10:00:00Z",
      "status": "SCHEDULED"
    }
  ]
}
```

**POST /api/appointments**
Create new appointment
```json
{
  "patientId": 5,
  "doctorId": 2,
  "time": "2025-11-30T10:00:00Z",
  "status": "SCHEDULED"
}
```

### Prescriptions

**GET /api/prescriptions**
List prescriptions
```
Query params: ?page=1&limit=20&patientId=5
```

**POST /api/prescriptions**
Create prescription
```json
{
  "patientId": 5,
  "notes": "Take after meals",
  "medicines": [
    {
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "After food"
    }
  ]
}
```

**GET /api/prescriptions/:id**
Get prescription details

### Staff Management

**GET /api/staff**
List staff members
```
Headers:
  Authorization: Bearer {token}
  x-tenant-id: {tenantId}
```
Response:
```json
{
  "staff": [
    {
      "id": 1,
      "name": "Dr. John Doe",
      "email": "doctor@hospital.com",
      "role": "DOCTOR",
      "status": "ACTIVE",
      "created_at": "2025-11-01T00:00:00Z"
    }
  ]
}
```

**POST /api/staff/add**
Add new staff (Admin only)
```json
{
  "name": "Dr. Jane Doe",
  "email": "newdoctor@hospital.com",
  "role": "DOCTOR",
  "password": "ChangeMe123"
}
```

### Platform Admin

**GET /platform/hospitals**
List all hospitals (Super Admin)
```
Headers:
  Authorization: Bearer {superAdminToken}
```

## 🔐 Authentication & Security

### JWT Implementation

**Access Token** (Short-lived, 1 hour)
- Stored in localStorage
- Used for API requests
- Contains user info and tenantId

**Refresh Token** (Long-lived, 7 days)
- Used to get new access tokens
- Stored securely

### Password Security

```javascript
// Hashing on registration
const hashedPassword = await bcrypt.hash(password, 10);

// Verification on login
const isValid = await bcrypt.compare(password, user.password);
```

### Middleware Protection

```javascript
// authMiddleware.js
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.userId = decoded.userId;
req.tenantId = decoded.tenantId;
req.tenantDbName = decoded.tenantDbName;
```

### Role-Based Access

```javascript
// Example: Only ADMIN can add staff
if (req.user.role !== 'ADMIN') {
  return res.status(403).json({ message: 'Forbidden' });
}
```

## ✅ Request Validation

### Using Zod

```javascript
const patientSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone'),
  email: z.string().email().optional(),
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional()
});

// In controller
try {
  const validatedData = patientSchema.parse(req.body);
  // ... use validatedData
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors
    });
  }
}
```

## 🔄 Database Migrations

### Tenant Schema Creation

When a new hospital registers:
1. Create entry in `tenants` table
2. Generate unique schema name: `tenant_{uuid}`
3. Run tenant template SQL
4. Create admin user in new schema

```javascript
// From authController.js
await client.query(`CREATE SCHEMA "${tenantDbName}"`);
await client.query(`SET search_path TO "${tenantDbName}"`);
// Run tenant template SQL
```

### Migration Scripts

**Migrate Existing Tenants**
```bash
node src/scripts/migratePatients.js
node src/scripts/migratePrescriptions.js
```

## 🐛 Error Handling

### Global Error Handler

```javascript
// In server.js
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

### Controller Error Pattern

```javascript
try {
  // ... business logic
  res.json({ success: true, data });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Failed to process request',
    error: error.message
  });
}
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

### Manual API Testing

Use tools like:
- **Postman**: Create collections for each endpoint
- **Thunder Client** (VS Code): Lightweight alternative
- **curl**: Command-line testing

Example:
```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"pass","hospitalId":"hospital1"}'

# Get patients (with token)
curl http://localhost:5001/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-tenant-id: 5"
```

## 📊 Database Utilities

### Connection Pool

```javascript
// dbConfigPg.js
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // Max connections
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
});
```

### Query Pattern

```javascript
const client = await pool.connect();
try {
  await client.query(`SET search_path TO "${schema}"`);
  const result = await client.query('SELECT * FROM patients');
  return result.rows;
} catch (error) {
  console.error(error);
  throw error;
} finally {
  await client.query('SET search_path TO public');
  client.release();
}
```

## 🚀 Deployment

### Environment Setup

1. Set all required environment variables
2. Use strong JWT secrets (generate with `openssl rand -base64 32`)
3. Configure database with SSL
4. Set NODE_ENV=production

### Running in Production

```bash
# Install dependencies
npm ci --production

# Start server
npm start
```

### Deploy to Render

1. Connect GitHub repository
2. Select "Web Service"
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables
6. Deploy

### Health Check Endpoint

Add a health check (recommended):
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});
```

## 🔧 Development Tips

### Debugging

```javascript
// Add detailed logging
console.log('Request body:', req.body);
console.log('User:', req.userId, 'Tenant:', req.tenantId);
```

### Database Debugging

```bash
# List all schemas
node src/scripts/debugSchemas.js

# Check tenant data
psql -d hms_db -c "SELECT * FROM tenants;"
```

## 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.1.0 | Web framework |
| pg | ^8.16.3 | PostgreSQL client |
| jsonwebtoken | ^9.0.2 | JWT auth |
| bcryptjs | ^3.0.3 | Password hashing |
| zod | ^4.1.13 | Validation |
| cors | ^2.8.5 | CORS middleware |
| dotenv | ^17.2.3 | Environment vars |
| multer | ^2.0.2 | File uploads |
| drizzle-orm | ^0.44.7 | SQL migrations |

## 📖 API Documentation

For detailed API docs, consider adding:
- Swagger/OpenAPI spec
- Postman collection
- API Blueprint

## 🤝 Contributing

When adding new endpoints:
1. Create controller in `controllers/`
2. Add Zod validation schema
3. Create route in `routes/`
4. Add middleware protection
5. Handle tenant isolation
6. Update this README

---

**Part of the Hospital Management System (HMS) project**
