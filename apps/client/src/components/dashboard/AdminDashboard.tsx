import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminDashboardStats } from "@/services/dashboardService";
import { STATIC_ADMIN_DATA } from "@/utils/staticData";

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(STATIC_ADMIN_DATA.stats);
  const [patientGrowthData, setPatientGrowthData] = useState(STATIC_ADMIN_DATA.patientGrowthData);
  const [appointmentsData, setAppointmentsData] = useState(STATIC_ADMIN_DATA.appointmentsData);
  const departmentData = STATIC_ADMIN_DATA.departmentData; // Always use static for department distribution

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getAdminDashboardStats();
      
      if (data.hasData) {
        // Use real data
        const realStats = [
          {
            title: "Total Patients",
            value: data.stats.totalPatients.toString(),
            change: "Real-time data",
            icon: "Users" as const,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Appointments",
            value: data.stats.totalAppointments.toString(),
            change: "Total appointments",
            icon: "Calendar" as const,
            gradient: "from-purple-500 to-pink-500",
          },
          {
            title: "Active Doctors",
            value: data.stats.activeDoctors.toString(),
            change: "Registered doctors",
            icon: "Activity" as const,
            gradient: "from-green-500 to-emerald-500",
          },
          {
            title: "Revenue",
            value: data.stats.revenue ? `$${data.stats.revenue.toFixed(2)}` : "N/A",
            change: data.stats.revenue ? "This month" : "Not tracked yet",
            icon: "DollarSign" as const,
            gradient: "from-orange-500 to-red-500",
          },
        ];

        setStats(realStats);

        // Use real patient growth data if available
        if (data.patientGrowthData && data.patientGrowthData.length > 0) {
          setPatientGrowthData(data.patientGrowthData.map((item: any) => ({
            month: item.month,
            patients: typeof item.patients === 'string' ? parseInt(item.patients) : item.patients
          })));
        }

        // Use real appointments data if available
        if (data.appointmentsData && data.appointmentsData.length > 0) {
          setAppointmentsData(data.appointmentsData.map((item: any) => ({
            day: item.day,
            count: typeof item.count === 'string' ? parseInt(item.count) : item.count
          })));
        }
      }
      // If no data, keep using static data (already set as initial state)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // On error, keep using static data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Map icon names to Lucide components
  const iconMap = {
    Users,
    Calendar,
    Activity,
    DollarSign,
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon as keyof typeof iconMap];
          return (
            <Card key={stat.title} className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Growth Chart */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Patient Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={patientGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointments This Week */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem 
              title="New patient admitted"
              time="5 minutes ago"
              type="patient"
            />
            <ActivityItem 
              title="Dr. Smith completed surgery"
              time="1 hour ago"
              type="success"
            />
            <ActivityItem 
              title="Lab results pending"
              time="2 hours ago"
              type="warning"
            />
            <ActivityItem 
              title="New staff member added"
              time="3 hours ago"
              type="info"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivityItem({ title, time, type }: { title: string; time: string; type: string }) {
  const colors = {
    patient: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-purple-500',
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`h-2 w-2 rounded-full ${colors[type as keyof typeof colors]} mt-2`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

