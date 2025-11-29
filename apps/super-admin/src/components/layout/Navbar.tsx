import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-40 ml-64 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{user?.hospitalName || 'HMS Core'}</h2>
          <p className="text-xs text-muted-foreground">Healthcare Excellence</p>
        </div>
        <span className="px-3 py-1 bg-green-500/10 text-green-700 desirous-xs rounded-full font-medium border border-green-200">
          ● Active License
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors relative rounded-full hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase() || 'Staff'}</p>
          </div>
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
            <User className="h-5 w-5" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
