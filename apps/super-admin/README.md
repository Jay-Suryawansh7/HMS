# HMS Super Admin Dashboard

Platform administration interface for managing all hospitals in the Hospital Management System. This React application provides centralized control over hospital creation, monitoring, and management.

## 🎯 Overview

The Super Admin Dashboard is a dedicated interface for platform administrators to:
- Manage multiple hospitals
- View system-wide statistics
- Create and configure new hospitals
- Monitor hospital status and activity

## 🏗️ Architecture

### Technology Stack

- **React 19**: Latest React features
- **Vite**: Build tool with HMR
- **TypeScript**: Type safety
- **TailwindCSS v4 Beta**: Modern utility-first CSS
- **React Router v7**: Routing
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **Lucide React**: Icons

### Project Structure

```
super-admin/
├── public/                # Static assets
├── src/
│   ├── components/       # Reusable components
│   │   └── ui/          # UI primitives
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Hospitals.tsx
│   ├── services/        # API services
│   │   └── apiService.ts
│   ├── lib/             # Utilities
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles (Tailwind v4)
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
# Navigate to super-admin directory
cd apps/super-admin

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

# Runs on http://localhost:5174
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 📱 Features

### Dashboard Overview
- **Hospital Count**: Total hospitals onboarded
- **Active Hospitals**: Currently active hospitals
- **Statistics**: Growth metrics and trends
- **Recent Activity**: Latest hospital registrations

### Hospital Management
- **Create Hospital**: Onboard new hospitals with all details
- **View Hospitals**: List all registered hospitals
- **Hospital Details**: View individual hospital information
- **Status Management**: Activate/deactivate hospitals

### Future Features (Roadmap)
- Billing and subscription management
- Hospital analytics and reporting
- Support ticket system
- Audit logs

## 🎨 UI Components

### Tailwind CSS v4

This app uses the **latest Tailwind CSS v4 beta** with modern syntax:

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-slate-50: #f8fafc;
  --color-indigo-500: #6366f1;
  --radius: 0.5rem;
}
```

**Note**: The CSS linter may show yellow warnings for `@theme` and `theme()` function. This is expected with Tailwind v4 beta and can be safely ignored.

### Custom Components

- **Card**: Content containers
- **Button**: Action buttons
- **Input**: Form inputs
- **Table**: Data tables
- **Modal**: Dialogs (future)

## 📡 API Integration

### API Service Layer

```typescript
// apiService.ts
const API_BASE = import.meta.env.VITE_API_URL;

export const getHospitals = async () => {
  const token = localStorage.getItem('superAdminToken');
  const response = await axios.get(`${API_BASE}/platform/hospitals`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createHospital = async (data: HospitalData) => {
  const token = localStorage.getItem('superAdminToken');
  const response = await axios.post(`${API_BASE}/platform/hospitals`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

### Auth Flow

1. Super admin logs in via `/login`
2. Backend returns JWT token
3. Token stored in localStorage as `superAdminToken`
4. Token sent in Authorization header for all requests
5. Access to `/dashboard` and `/hospitals` routes

## 🔐 Authentication

### Login Component

```tsx
const handleLogin = async (credentials) => {
  const response = await axios.post('/api/auth/super-admin/login', credentials);
  localStorage.setItem('superAdminToken', response.data.token);
  navigate('/dashboard');
};
```

### Protected Routes

```tsx
<Route path="/" element={<Login />} />
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
```

## 🎯 Routing

```
/                    → Login Page
/dashboard           → Super Admin Dashboard
/hospitals           → Hospital Management
/hospitals/:id       → Hospital Details (future)
```

## 📊 Dashboard Metrics

### Statistics Display

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>
    <CardTitle>Total Hospitals</CardTitle>
    <CardValue>{totalHospitals}</CardValue>
  </Card>
  <Card>
    <CardTitle>Active Hospitals</CardTitle>
    <CardValue>{activeHospitals}</CardValue>
  </Card>
  <Card>
    <CardTitle>Growth</CardTitle>
    <CardValue>+{growthPercentage}%</CardValue>
  </Card>
</div>
```

### Charts (using Recharts)

```tsx
<AreaChart data={monthlyData}>
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Area type="monotone" dataKey="hospitals" fill="#6366f1" />
</AreaChart>
```

## 🏥 Hospital Creation

### Hospital Registration Form

Required fields:
- Hospital Name
- Subdomain (unique identifier)
- License Number
- Admin Name
- Admin Email
- Password
- Contact Number
- Address
- City
- State
- Pincode

### Validation

```typescript
const hospitalSchema = z.object({
  hospitalName: z.string().min(1, 'Required'),
  subdomain: z.string()
    .min(3, 'At least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  licenseNumber: z.string().min(1, 'Required'),
  adminEmail: z.string().email('Invalid email'),
  contactNumber: z.string().regex(/^[0-9]{10}$/, '10 digits required'),
  pincode: z.string().regex(/^[0-9]{6}$/, '6 digits required')
});
```

### Submission

```typescript
const onSubmit = async (data: HospitalFormData) => {
  try {
    await createHospital(data);
    toast.success('Hospital created successfully!');
    navigate('/hospitals');
  } catch (error) {
    toast.error('Failed to create hospital');
  }
};
```

## 🎨 Styling with Tailwind v4

### Benefits

- **CSS-first configuration**: Define in CSS, not JS
- **Native nesting**: No PostCSS plugins needed
- **Faster builds**: Oxide engine
- **Modern syntax**: `@import` and `@theme`

### Custom Theme

```css
@theme {
  /* Colors */
  --color-slate-*: #values;
  --color-indigo-*: #values;
  --color-emerald-*: #values;
  
  /* Radius */
  --radius: 0.5rem;
}

/* Apply theme colors */
body {
  background: theme('colors.slate.50');
}
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  {/* Mobile: 1 column, Desktop: 2 columns */}
</div>
```

## 🔧 Configuration

### Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:5001'
    }
  }
});
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🐛 Common Issues & Solutions

### Issue: Tailwind Not Applying
**Solution**: Restart dev server after modifying `index.css`
```bash
npm run dev
```

### Issue: API CORS Errors
**Solution**: Backend must allow super-admin origin
```javascript
// Backend CORS config
cors({
  origin: ['http://localhost:5174', 'https://your-admin-domain.com']
})
```

### Issue: 404 on Refresh
**Solution**: Configure for SPA routing
```javascript
// vite.config.ts server config
historyApiFallback: true
```

## 📊 Performance

### Code Splitting

```tsx
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Hospitals = lazy(() => import('./pages/Hospitals'));
```

### Bundle Size

- Tailwind v4: Smaller CSS output
- Vite: Tree-shaking and minification
- React 19: Improved bundle efficiency

## 🧪 Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests  
npm run test:e2e
```

## 📦 Deployment

### Build

```bash
npm run build
# Creates dist/ folder
```

### Deploy to Netlify

1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable: `VITE_API_URL`
5. Add redirect rule for SPA:
```
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy to Vercel

Similar process:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment: `VITE_API_URL`

## 🔐 Security Considerations

### Token Storage

```typescript
// Store JWT securely
localStorage.setItem('superAdminToken', token);

// Clear on logout
const logout = () => {
  localStorage.removeItem('superAdminToken');
  navigate('/');
};
```

### API Security

- All requests require valid JWT
- Backend validates super admin role
- HTTPS in production
- CORS restricted to admin domain

## 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI library |
| vite | ^7.2.4 | Build tool |
| tailwindcss | ^4.0.0-beta | Styling (v4) |
| react-router-dom | ^7.9.6 | Routing |
| axios | ^1.13.2 | HTTP client |
| recharts | ^3.5.1 | Charts |
| lucide-react | ^0.555.0 | Icons |

## 🚧 Future Enhancements

1. **Analytics Dashboard**
   - Hospital usage metrics
   - User activity tracking
   - Revenue analytics

2. **Subscription Management**
   - Billing integration
   - Plan upgrades/downgrades
   - Payment tracking

3. **Support System**
   - Hospital support tickets
   - Chat integration
   - Knowledge base

4. **Audit Logs**
   - Track all admin actions
   - Hospital activity logs
   - Security monitoring

## 🤝 Contributing

When adding features:
1. Follow existing component patterns
2. Use TypeScript for type safety
3. Maintain Tailwind v4 syntax
4. Add proper error handling
5. Update this README

## 📖 Learn More

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [React Router](https://reactrouter.com/)
- [Recharts](https://recharts.org/)

---

**Super Admin Portal for Hospital Management System**
