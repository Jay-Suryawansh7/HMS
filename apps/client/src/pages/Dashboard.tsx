import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
import { NurseDashboard } from "@/components/dashboard/NurseDashboard";
import { ReceptionistDashboard } from "@/components/dashboard/ReceptionistDashboard";
import { PharmacistDashboard } from "@/components/dashboard/PharmacistDashboard";

export function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'NURSE':
        return <NurseDashboard />;
      case 'RECEPTIONIST':
        return <ReceptionistDashboard />;
      case 'PHARMACIST':
        return <PharmacistDashboard />;
      default:
        // Default to Admin dashboard or a generic welcome screen if role is unknown
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in your department today.
        </p>
      </div>
      
      {renderDashboard()}
    </div>
  );
}
