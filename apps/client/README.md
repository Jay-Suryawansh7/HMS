# HMS Client Application

The main hospital dashboard frontend application for the Hospital Management System. This React-based SPA provides role-specific interfaces for hospital staff including Admins, Doctors, Nurses, Receptionists, and Pharmacists.

## 🎯 Overview

This is the primary user interface for hospital staff to manage day-to-day operations including patient registration, appointment scheduling, prescription management, and staff administration.

## 🏗️ Architecture

### Technology Stack

- **React 19**: Latest React with concurrent features
- **Vite**: Lightning-fast build tool and dev server
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **React Router v7**: Client-side routing
- **React Hook Form**: Performant form handling
- **Zod**: Runtime validation
- **Axios**: HTTP client
- **Shadcn/UI**: Component library

### Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── dashboard/    # Role-specific dashboards
│   │   ├── layout/       # Layout components (Sidebar, Navbar)
│   │   └── ui/          # UI primitives (Shadcn/UI)
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   ├── RegisterPatient.tsx
│   │   ├── Appointments.tsx
│   │   ├── CreateAppointment.tsx
│   │   ├── Prescriptions.tsx
│   │   ├── CreatePrescription.tsx
│   │   ├── ViewPrescription.tsx
│   │   ├── Settings.tsx
│   │   └── LandingPage.tsx
│   ├── services/         # API service layer
│   │   ├── authService.ts
│   │   ├── patientService.ts
│   │   └── prescriptionService.ts
│   ├── lib/             # Utilities
│   │   └── utils.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Navigate to client directory
cd apps/client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5001/api
```

For production:
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Development

```bash
# Start development server
npm run dev

# Runs on http://localhost:5173
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 📱 Features by Role

### Admin Dashboard
- **Hospital Overview**: Stats on patients, doctors, appointments
- **Staff Management**: Add/manage doctors, nurses, receptionists, pharmacists
- **Patient Management**: Full patient record access
- **System Settings**: Hospital configuration

### Doctor Dashboard
- **Patient List**: View assigned patients
- **Appointments**: Manage doctor's appointments
- **Prescriptions**: Create and view prescriptions
- **Medical Records**: Access patient history

### Nurse Dashboard
- **Patient Care**: View and update patient information
- **Task Management**: Assigned nursing tasks
- **Appointments**: Today's schedule

### Receptionist Dashboard
- **Appointment Booking**: Schedule patient appointments
- **Patient Registration**: Register new patients
- **Front Desk**: Check-ins and basic patient info

### Pharmacist Dashboard
- **Prescriptions**: View prescriptions for dispensing
- **Medicine Inventory**: (Future feature)
- **Dispensing Records**: Track medicine distribution

## 🎨 UI Components

### Shadcn/UI Integration

The app uses Shadcn/UI components which are:
- Fully accessible (ARIA compliant)
- Customizable with TailwindCSS
- Built on Radix UI primitives

Key components used:
- **Button**: Primary actions
- **Card**: Content containers
- **Dialog**: Modals and popups
- **Form**: Input, Select, Label
- **Table**: Data display
- **Tabs**: Content organization

### Custom Components

#### DashboardLayout
Main layout wrapper with sidebar and navbar
```tsx
<DashboardLayout>
  <Outlet /> {/* Nested routes */}
</DashboardLayout>
```

#### ProtectedRoute
Ensures authentication before accessing routes
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

## 🔐 Authentication Flow

1. User enters credentials on LandingPage
2. AuthService sends request to backend
3. JWT tokens stored in localStorage
4. AuthContext provides user data to app
5. Protected routes check authentication
6. Token refresh on expiry

```typescript
// AuthContext usage
const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login({ email, password, hospitalId });

// Access user data
console.log(user.role); // 'ADMIN', 'DOCTOR', etc.
```

## 📡 API Integration

### Service Layer Pattern

All API calls go through service modules:

```typescript
// patientService.ts
export const createPatient = async (data: PatientData) => {
  const response = await apiClient.post('/patients', data);
  return response.data;
};

// Usage in component
import { createPatient } from '@/services/patientService';

const handleSubmit = async (data) => {
  await createPatient(data);
  toast.success('Patient registered!');
};
```

### Axios Interceptors

Automatically inject auth headers:

```typescript
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  const tenantId = getTenantId();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }
  
  return config;
});
```

## 🎯 Routing Structure

```
/                          → Landing Page (Login/Signup)
/dashboard                 → Role-based Dashboard
/dashboard/patients        → Patient List
/dashboard/patients/new    → Register Patient
/dashboard/patients/edit/:id → Edit Patient
/dashboard/appointments    → Appointments List
/dashboard/appointments/create → Book Appointment
/dashboard/prescriptions   → Prescriptions List
/dashboard/prescriptions/create → New Prescription
/dashboard/prescriptions/:id → View Prescription
/dashboard/settings        → Settings (Admin only)
/dashboard/change-password → Change Password
```

## 🔄 State Management

### React Context

- **AuthContext**: Global authentication state
- **Future**: Consider adding PatientContext, AppointmentContext for complex state

### Local State

- Forms: React Hook Form
- UI State: useState, useReducer
- Server State: Axios + manual state management
- **Future Consideration**: React Query for server state

## 📝 Form Handling

### React Hook Form + Zod

```typescript
const formSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  email: z.string().email().optional()
});

type FormData = z.infer<typeof formSchema>;

const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(formSchema)
});

const onSubmit = (data: FormData) => {
  // Type-safe form data
};
```

## 🎨 Styling Guide

### TailwindCSS Utilities

```tsx
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Dark mode support
<div className="bg-white dark:bg-slate-900">

// Custom CSS variables
// Defined in index.css for consistent theming
```

### Theme Configuration

Colors, spacing, and breakpoints in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary))',
      secondary: 'hsl(var(--secondary))',
    }
  }
}
```

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Ensure backend CORS is configured for frontend origin
```javascript
// Backend should have:
cors({ origin: 'http://localhost:5173' })
```

### Issue: 404 on Page Refresh
**Solution**: Configure Vite for SPA routing
```javascript
// vite.config.ts
server: {
  historyApiFallback: true
}
```

### Issue: Environment Variables Not Loading
**Solution**: Prefix with `VITE_` and restart dev server
```env
VITE_API_URL=...  # ✅ Works
API_URL=...       # ❌ Won't work
```

## 📊 Performance Optimization

### Code Splitting

Routes are lazy-loaded:
```tsx
const Patients = lazy(() => import('./pages/Patients'));
```

### Image Optimization

- Use WebP format
- Lazy load images with `loading="lazy"`
- Compress images before upload

### Bundle Analysis

```bash
npm run build
# Check dist/ folder size
# Look for large chunks
```

## 🧪 Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 📦 Deployment

### Build Output

```bash
npm run build
# Creates dist/ folder with optimized static files
```

### Deploy to Render

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL`

### Deploy to Netlify/Vercel

Similar process, ensure:
- Build command: `npm run build`
- Publish directory: `dist`
- Add `_redirects` file for SPA routing:
```
/*  /index.html  200
```

## 🔧 Development Tips

### Hot Reload

Vite provides instant HMR - changes reflect immediately without full page reload.

### TypeScript Errors

```bash
# Check types without building
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI library |
| vite | ^7.2.4 | Build tool |
| react-router-dom | ^7.9.6 | Routing |
| react-hook-form | ^7.67.0 | Forms |
| zod | ^4.1.13 | Validation |
| axios | ^1.13.2 | HTTP client |
| tailwindcss | ^3.4.18 | Styling |
| lucide-react | ^0.555.0 | Icons |
| recharts | ^3.5.1 | Charts |
| sonner | ^2.0.7 | Toasts |

## 🤝 Contributing

When adding new features:
1. Create components in appropriate folders
2. Add types in service files
3. Use existing patterns (service layer, form handling)
4. Follow naming conventions
5. Update this README if adding new patterns

##  Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**Part of the Hospital Management System (HMS) project**
