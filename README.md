# Hospital Management System (HMS)

A comprehensive, multi-tenant hospital management system built with modern web technologies. This system provides role-based dashboards, patient management, prescription tracking, appointment scheduling, and administrative tools.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 🌟 Features

### Multi-Tenancy Architecture
- **Schema-Per-Tenant**: Each hospital gets its own isolated database schema
- **Secure Tenant Isolation**: Complete data separation between hospitals
- **Centralized Platform Admin**: Manage all hospitals from a single super-admin dashboard

### Role-Based Access Control (RBAC)
- **Admin**: Full hospital management, staff administration
- **Doctor**: Patient records, prescriptions, appointments
- **Nurse**: Patient care, task management
- **Receptionist**: Appointment booking, patient registration
- **Pharmacist**: Prescription viewing and dispensing
- **Super Admin**: Platform-wide hospital management

### Core Functionality
- **Patient Management**: Registration, records, medical history
- **Prescription System**: Digital prescriptions with medicines and dosages
- **Appointment Scheduling**: Book and manage appointments
- **Staff Management**: Add and manage hospital staff
- **Dashboard Analytics**: Role-specific insights and metrics

## 🏗️ Project Structure

```
HMS/
├── apps/
│   ├── client/          # Main hospital dashboard (React + Vite)
│   ├── server/          # Backend API (Node.js + Express)
│   └── super-admin/     # Platform admin dashboard (React + Vite)
├── docker-compose.yml   # Docker orchestration
└── README.md           # This file
```

## 🛠️ Technology Stack

### Frontend

#### **React 19** 
Modern UI library with latest features including concurrent rendering and automatic batching.

#### **Vite**
Lightning-fast build tool with:
- Hot Module Replacement (HMR)
- Optimized production builds
- Native ES modules support

#### **TypeScript**
Type-safe development with:
- Static type checking
- Enhanced IDE support
- Better code documentation

#### **TailwindCSS**
Utility-first CSS framework for:
- Rapid UI development
- Consistent design system
- Responsive design

#### **Shadcn/UI**
High-quality, accessible component library built with:
- Radix UI primitives
- Fully customizable components
- Dark mode support

#### **React Hook Form**
Performant form library featuring:
- Minimal re-renders
- Easy validation
- Small bundle size

#### **Zod**
TypeScript-first schema validation:
- Runtime type checking
- Automatic type inference
- Composable schemas
```typescript
// Example Zod schema
const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().regex(/^[0-9]{10}$/),
  email: z.string().email().optional()
});
```

#### **React Router v7**
Client-side routing with:
- Nested routes
- Protected routes
- Programmatic navigation

#### **Recharts**
Composable charting library for data visualization

#### **Axios**
Promise-based HTTP client for API communication

### Backend

#### **Node.js + Express**
Lightweight, fast backend server with:
- RESTful API architecture
- Middleware support
- Easy integration

#### **PostgreSQL**
Robust relational database featuring:
- ACID compliance
- Schema-per-tenant support
- Advanced indexing

#### **Drizzle ORM** (Minimal Usage)
TypeScript ORM for database migrations:
- Type-safe queries
- Automatic migrations
- Schema introspection
```javascript
// Drizzle is primarily used for schema migrations
// Example migration
await client.query(`
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
  )
`);
```

#### **Zod (Backend)**
Request validation and data integrity:
- API request validation
- Consistent error messages
- Type-safe data parsing

#### **JWT (JSON Web Tokens)**
Secure authentication with:
- Stateless sessions
- Token refresh mechanism
- Role-based access control

#### **bcryptjs**
Password hashing for security:
- Salt rounds for extra security
- One-way encryption
- Industry-standard algorithm

#### **Redis** (Optional)
In-memory caching (configured but optional):
- Session storage
- Performance optimization
- Real-time data

### DevOps & Tools

#### **Docker**
Containerization platform providing:
- **Consistent Environments**: Same setup across dev, staging, and production
- **Easy Deployment**: Package entire application stack
- **Isolation**: Services run in isolated containers
- **Scalability**: Easy horizontal scaling
- **Version Control**: Lock specific versions of dependencies

```yaml
# docker-compose.yml orchestrates multiple services
services:
  postgres:    # Database
  redis:       # Caching (optional)
  backend:     # API server
  frontend:    # Client application
```

Benefits of Docker in this project:
1. **Multi-service Management**: Run PostgreSQL, Redis, Backend, and Frontend together
2. **No Local Setup Hassles**: No need to install PostgreSQL or Redis locally
3. **Environment Parity**: Dev environment matches production
4. **Quick Onboarding**: New developers can start with `docker-compose up`

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm** or **yarn**: Package manager
- **PostgreSQL**: v14 or higher (or use Docker)
- **Git**: Version control

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/Jay-Suryawansh7/HMS.git
cd HMS
```

2. **Set up environment variables**
```bash
# Copy .env.example files
cp apps/server/.env.example apps/server/.env
cp apps/client/.env.example apps/client/.env
cp apps/super-admin/.env.example apps/super-admin/.env
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the applications**
- Client Dashboard: `http://localhost:5173`
- Super Admin: `http://localhost:5174`
- API Server: `http://localhost:5001`

### Manual Setup

#### 1. Install Dependencies

```bash
# Install backend dependencies
cd apps/server
npm install

# Install client dependencies
cd ../client
npm install

# Install super-admin dependencies
cd ../super-admin
npm install
```

#### 2. Configure Environment

**Backend (.env)**
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hms_db
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:5001/api
```

**Super Admin (.env)**
```env
VITE_API_URL=http://localhost:5001/api
```

#### 3. Initialize Database

```bash
cd apps/server
npm run db:migrate
```

#### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd apps/server
npm run dev

# Terminal 2 - Client
cd apps/client
npm run dev

# Terminal 3 - Super Admin
cd apps/super-admin
npm run dev
```

## 📱 Application Architecture

### Multi-Tenant Database Design

```
┌─────────────────────┐
│   Public Schema     │
├─────────────────────┤
│ • tenants           │
│ • platform_admins   │
└─────────────────────┘
         │
         ├─── tenant_hospital1
         │    ├── users
         │    ├── patients
         │    ├── appointments
         │    ├── prescriptions
         │    └── tasks
         │
         ├─── tenant_hospital2
         │    ├── users
         │    ├── patients
         │    └── ...
         │
         └─── tenant_hospitalN
              └── ...
```

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌────────────┐
│  Client  │────▶│   API    │────▶│  Database  │
└──────────┘     └──────────┘     └────────────┘
     │                 │
     │    JWT Token    │
     │◀────────────────┘
     │
     ▼
 [Protected Routes]
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Access and refresh tokens
- **Tenant Isolation**: Schema-level data separation
- **CORS Protection**: Configured for specific origins
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## 📊 Database Schema

### Core Tables

**Users** (Per Tenant)
- id, name, email, password, role, status

**Patients** (Per Tenant)
- id, patient_id, first_name, last_name, phone, email, dob, gender, blood_group

**Appointments** (Per Tenant)
- id, patient_id, doctor_id, time, status

**Prescriptions** (Per Tenant)
- id, prescription_id, doctor_id, patient_id, notes, created_at

**Prescription Items** (Per Tenant)
- id, prescription_id, medicine_name, dosage, frequency, duration

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Hospital registration
- `POST /api/auth/refresh` - Refresh access token

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Register new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/export` - Export to CSV

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id` - Get prescription details

### Staff Management
- `GET /api/staff` - List staff members
- `POST /api/staff/add` - Add new staff (Admin only)

### Platform Admin
- `GET /platform/hospitals` - List all hospitals
- `POST /platform/hospitals` - Add new hospital

## 🔄 Recent Development Highlights

### Latest Features (Last 20 Commits)

1. **Appointment System** - Complete booking and listing functionality
2. **Role-Based Dashboards** - Custom views for each user role
3. **Prescription Management** - Digital prescription creation and viewing
4. **Access Control Refinement** - Granular permissions per role
5. **Multi-tenant Support** - Robust schema-per-tenant architecture
6. **Data Validation** - Enhanced Zod schemas throughout
7. **Bug Fixes** - Schema mismatches, defensive programming
8. **UI Improvements** - Consistent design across all dashboards

See [CHANGELOG.md](./CHANGELOG.md) for detailed commit history.

## 📝 Development Workflow

### Adding a New Feature

1. **Create Feature Branch**
```bash
git checkout -b feature/new-feature
```

2. **Develop and Test**
- Write clean, documented code
- Add Zod validation for new endpoints
- Test with different user roles

3. **Commit with Descriptive Message**
```bash
git commit -m "feat: Add patient export functionality"
```

4. **Push and Create PR**
```bash
git push origin feature/new-feature
```

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 🧪 Testing

```bash
# Backend tests
cd apps/server
npm test

# Frontend tests
cd apps/client
npm test
```

## 📦 Production Deployment

### Build for Production

```bash
# Build client
cd apps/client
npm run build

# Build super-admin
cd apps/super-admin
npm run build

# Backend is ready to deploy as-is
cd apps/server
npm start
```

### Environment Variables (Production)

Ensure all production environment variables are set:
- Database connection strings
- JWT secrets (use strong, unique values)
- CORS origins (restrict to your domains)
- Redis connection  (if using)

### Deployment Platforms

The project is configured for deployment on:
- **Render** (Backend + Frontend)
- **Vercel** (Frontend)
- **Railway** (Backend + Database)
- **Netlify** (Frontend)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Developer**: Jay Suryawansh
- **GitHub**: [@Jay-Suryawansh7](https://github.com/Jay-Suryawansh7)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: [your-email]
- Documentation: [Link to docs]

## 🎓 Learning Resources

### Technologies Used

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Node.js**: https://nodejs.org
- **Express**: https://expressjs.com
- **PostgreSQL**: https://www.postgresql.org
- **Drizzle ORM**: https://orm.drizzle.team
- **Zod**: https://zod.dev
- **TailwindCSS**: https://tailwindcss.com
- **Docker**: https://www.docker.com

---

**Built with ❤️ using modern web technologies**
