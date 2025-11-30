import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, Users, Building2, Stethoscope, 
  LogOut, Shield, Search, Phone, Pill
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Hospital {
  id: string;
  hospital_name: string;
  subdomain: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'VERIFIED';
  created_at: string;
  stats: {
    doctors: number;
    nurses: number;
    receptionists: number;
    pharmacists: number;
    staff: number;
    patients: number;
  };
}

export function Dashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('platformToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchHospitals();
  }, [navigate]);

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem('platformToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/platform/hospitals`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          return;
        }
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();
      setHospitals(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('platformToken');
    localStorage.removeItem('platformUser');
    navigate('/login');
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const token = localStorage.getItem('platformToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/platform/hospitals/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      setHospitals(prev => prev.map(h => 
        h.id === id ? { ...h, status: newStatus as any } : h
      ));
      toast.success(`Hospital ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHospitals = hospitals.length;
  const totalDoctors = hospitals.reduce((acc, h) => acc + h.stats.doctors, 0);
  const totalPatients = hospitals.reduce((acc, h) => acc + h.stats.patients, 0);
  const totalReceptionists = hospitals.reduce((acc, h) => acc + (h.stats.receptionists || 0), 0);
  const totalPharmacists = hospitals.reduce((acc, h) => acc + (h.stats.pharmacists || 0), 0);
  const activeHospitals = hospitals.filter(h => h.status === 'ACTIVE').length;

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="font-bold text-lg">HMS Platform Admin</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={Building2} title="Total Hospitals" value={totalHospitals} subtext={`${activeHospitals} Active`} />
          <StatsCard icon={Stethoscope} title="Total Doctors" value={totalDoctors} subtext="Across all hospitals" />
          <StatsCard icon={Users} title="Total Patients" value={totalPatients} subtext="Registered patients" />
          <StatsCard icon={Phone} title="Receptionists" value={totalReceptionists} subtext="Front desk staff" />
          <StatsCard icon={Pill} title="Pharmacists" value={totalPharmacists} subtext="Pharmacy staff" />
          <StatsCard icon={Activity} title="System Health" value="99.9%" subtext="Uptime" />
        </div>

        {/* Hospitals Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Hospital Directory</h2>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search hospitals..." 
                className="pl-8 bg-slate-900 border-slate-800 text-slate-100 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900/50">
                    <TableHead className="text-slate-400">Hospital Name</TableHead>
                    <TableHead className="text-slate-400">Subdomain</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Doctors</TableHead>
                    <TableHead className="text-slate-400">Nurses</TableHead>
                    <TableHead className="text-slate-400">Receptionists</TableHead>
                    <TableHead className="text-slate-400">Pharmacists</TableHead>
                    <TableHead className="text-slate-400">Patients</TableHead>
                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHospitals.map((hospital) => (
                    <TableRow key={hospital.id} className="border-slate-800 hover:bg-slate-900/50">
                      <TableCell className="font-medium text-slate-200">{hospital.hospital_name}</TableCell>
                      <TableCell className="text-slate-400">{hospital.subdomain}.hms.com</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            hospital.status === 'ACTIVE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {hospital.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{hospital.stats.doctors}</TableCell>
                      <TableCell className="text-slate-300">{hospital.stats.nurses}</TableCell>
                      <TableCell className="text-slate-300">{hospital.stats.receptionists || 0}</TableCell>
                      <TableCell className="text-slate-300">{hospital.stats.pharmacists || 0}</TableCell>
                      <TableCell className="text-slate-300">{hospital.stats.patients}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={hospital.status === 'ACTIVE' ? "destructive" : "default"}
                          onClick={() => toggleStatus(hospital.id, hospital.status)}
                          className={hospital.status !== 'ACTIVE' ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        >
                          {hospital.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ icon: Icon, title, value, subtext }: { icon: any, title: string, value: string | number, subtext: string }) {
  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <Icon className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{subtext}</p>
      </CardContent>
    </Card>
  );
}
