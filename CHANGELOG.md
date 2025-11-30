# Changelog

All notable changes to the Hospital Management System project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive README files for all applications
- Detailed tech stack documentation
- API endpoint documentation
- Database schema documentation

## [1.0.0] - 2025-11-30

### Added - Documentation
- **Main README**: Complete project overview with tech stack explanations (Docker, Zod, Drizzle, etc.)
- **Client README**: Frontend architecture, components, routing, and styling guide
- **Server README**: Backend API documentation, database schema, authentication flow
- **Super Admin README**: Platform administration guide with Tailwind v4 details

### Added - Features
- **Appointment System**: Complete booking and management functionality
  - Book appointments with patient/doctor selection
  - Date and time scheduling
  - Appointment listing for all roles
  
- **Role-Based Dashboards**: Custom views for each user role
  - Admin dashboard with hospital overview
  - Doctor dashboard with patient and prescription access
  - Nurse dashboard with patient care features
  - Receptionist dashboard with appointment booking
  - Pharmacist dashboard with prescription viewing
  
- **Prescription Management**: Digital prescription system
  - Create prescriptions with multiple medicines
  - View prescription details with doctor/patient names
  - Prescription listing with filtering
  
- **Access Control Refinement**: Granular role-based permissions
  - Settings tab hidden for non-Admin users
  - Create Prescription button hidden for Pharmacists
  - Prescriptions tab hidden for Receptionists
  - Appointment booking enabled for Receptionists

### Fixed - Appointment System
- **Patient Name Query**: Fixed `getAllAppointments` to correctly concatenate patient first_name and last_name
- **Schema Mismatch**: Removed non-existent 'reason' field from appointments table operations
- **Empty Dropdowns**: Fixed patient/doctor data loading in appointment booking form
  - Added x-tenant-id header to API requests
  - Corrected response data parsing (response.data.staff)
- **404 Error**: Created missing POST /api/appointments endpoint
- **Data Validation**: Added defensive Array.isArray() checks to prevent map errors

### Fixed - Prescription System
- **Blank Screen**: Resolved ViewPrescription component blank screen issue
- **Missing Doctor Name**: Fixed getPrescription query to include JOINs with users and patients tables
- **Unknown Doctor Display**: Prescription view now correctly shows doctor and patient names

### Fixed - UI and Access
- **Staff Addition**: Enabled Receptionist and Pharmacist roles to be added
- **Dashboard Counts**: Updated Super Admin dashboard to display Receptionist and Pharmacist counts
- **Sidebar Filtering**: Implemented role-based sidebar item visibility
- **Form Validation**: Improved patient registration form with proper error handling

### Fixed - Deployment and Infrastructure
- **DOM Warnings**: Fixed hydration errors and React warnings
- **Patient Migration**: Resolved missing tenant references during data migration
- **Database Schema**: Added SSL support for production PostgreSQL connections
- **Error Handling**: Implemented global error handler for better debugging

## [0.9.0] - 2025-11-29

### Added
- Multi-tenant architecture with schema-per-tenant design
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Patient management system with CSV export
- Staff management for hospitals
- Platform admin dashboard for hospital onboarding

### Security
- Password hashing with bcrypt
- Tenant isolation at database level
- Protected API routes with middleware
- SQL injection prevention with parameterized queries

## Recent Commits (Latest First)

```
55af6f6 docs: Add comprehensive README files for all applications
3c6d35c fix: Correct patient name query in getAllAppointments
8f1e267 fix: Remove reason field from CreateAppointment form
5f3d98a fix: Remove reason field from appointments INSERT
1b88f4f feat: Add POST /api/appointments endpoint
ea0142a Fix: Parse backend response correctly in CreateAppointment
d38c75d Fix: Add x-tenant-id header to CreateAppointment API calls
a1d5070 Fix: Add defensive array checks in Appointments
43e3433 Fix: Add defensive array checks in CreateAppointment
b1b470e Refine receptionist access and add appointment booking
4eb40f8 Restrict access and visibility based on roles
61ce999 Fix missing doctor name in prescription view
2f319d0 Fix prescription view blank screen
c491a46 Fix staff addition and update Super Admin dashboard
8eb0ca1 Implement role-based dashboards
cf62156 Add prescriptions tables to database schema
5bdde98 Fix deployment errors: Add global error handler and fix DOM warnings
7b25cd3 Fix missing tenants in patient migration
5dd4bb6 Fix patient registration form validation errors
585ea1a Fix patient registration error: Update database schema and add SSL support
```

## Development Notes

### Tech Stack Evolution
- **Frontend**: React 19 with Vite for lightning-fast development
- **Backend**: Node.js with Express for robust API server
- **Database**: PostgreSQL with schema-per-tenant for multi-tenancy
- **Validation**: Zod for type-safe runtime validation
- **Styling**: TailwindCSS v3 (client) and v4 beta (super-admin)
- **State Management**: React Context API with planned React Query integration

### Architecture Decisions
1. **Schema-Per-Tenant**: Each hospital has isolated database schema
2. **Service Layer Pattern**: API calls abstracted into service modules
3. **Component Library**: Shadcn/UI for consistent, accessible components
4. **Environment-Based Config**: Separate configs for dev, staging, production

## Migration Guide

### From 0.9.0 to 1.0.0

#### Database
No breaking changes. Existing data is compatible.

#### API
- New endpoint: `POST /api/appointments` for creating appointments
- Removed field: `reason` from appointments (was never in schema)

#### Frontend
- Added new routes: `/dashboard/appointments/create`
- Enhanced sidebar with role-based filtering
- Updated all API calls to include x-tenant-id header

## Known Issues

None at this time. All critical bugs have been resolved.

## Future Roadmap

### Version 1.1.0 (Planned)
- [ ] Medicine inventory management
- [ ] Task assignment system for nurses
- [ ] Patient medical history timeline
- [ ] Advanced search and filtering

### Version 1.2.0 (Planned)
- [ ] Billing and invoicing system
- [ ] Insurance claim management
- [ ] Report generation (PDF)
- [ ] Email notifications

### Version 2.0.0 (Future)
- [ ] Mobile applications (iOS/Android)
- [ ] Video consultation integration
- [ ] Lab results management
- [ ] Bed/ward management

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information, see the README files in each application directory:
- [Main README](./README.md)
- [Client README](./apps/client/README.md)
- [Server README](./apps/server/README.md)
- [Super Admin README](./apps/super-admin/README.md)
