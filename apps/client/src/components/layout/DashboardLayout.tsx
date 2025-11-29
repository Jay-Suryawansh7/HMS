
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Sidebar />
      <Navbar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
