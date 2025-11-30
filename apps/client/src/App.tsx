import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { RegisterPatient } from '@/pages/RegisterPatient';
import { Doctors } from '@/pages/Doctors';
import { Appointments } from '@/pages/Appointments';
import CreateAppointment from '@/pages/CreateAppointment';
import Settings from '@/pages/Settings';
import Prescriptions from '@/pages/Prescriptions';
import CreatePrescription from '@/pages/CreatePrescription';
import ViewPrescription from '@/pages/ViewPrescription';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ChangePassword from '@/pages/ChangePassword';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/register" element={<RegisterPatient />} />
              <Route path="patients/edit/:id" element={<RegisterPatient />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/create" element={<CreateAppointment />} />
              <Route path="prescriptions" element={<Prescriptions />} />
              <Route path="prescriptions/create" element={<CreatePrescription />} />
              <Route path="prescriptions/:id" element={<ViewPrescription />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
