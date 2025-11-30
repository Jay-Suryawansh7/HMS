import { LayoutDashboard, Users, UserPlus, FileText, Settings, LogOut, Pill, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Patients', href: '/dashboard/patients' },
  { icon: UserPlus, label: 'Doctors', href: '/dashboard/doctors' },
  { icon: FileText, label: 'Appointments', href: '/dashboard/appointments' },
  { icon: Pill, label: 'Prescriptions', href: '/dashboard/prescriptions' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: Lock, label: 'Change Password', href: '/dashboard/change-password' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredItems = sidebarItems.filter(item => {
    if (item.label === 'Settings') {
      return user?.role === 'ADMIN';
    }
    return true;
  });

  return (
    <aside className="w-64 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HMS Core</h1>
            <p className="text-xs text-white/60">Healthcare Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-white/15 text-white shadow-lg backdrop-blur-sm" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
              )}
              <Icon className={cn(
                "h-5 w-5 transition-all",
                isActive ? "text-white" : "text-white/60 group-hover:text-white"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/70 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
