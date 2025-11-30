import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, AlertCircle, TrendingUp, ClipboardList } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDoctorDashboardStats } from "@/services/dashboardService";
import { STATIC_DOCTOR_DATA } from "@/utils/staticData";

export function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(STATIC_DOCTOR_DATA.stats);
  const [recoveryData, setRecoveryData] = useState(STATIC_DOCTOR_DATA.recoveryData);
  const [appointmentsTrend, setAppointmentsTrend] = useState(STATIC_DOCTOR_DATA.appointmentsTrend);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getDoctorDashboardStats();
      
      if (data.hasData) {
        // Use real data
        const realStats = [
          {
            title: "Pending Surgeries",
            value: data.stats.pendingSurgeries.toString(),
            change: "Scheduled",
            icon: "Activity" as const,
            gradient: "from-red-500 to-orange-500",
          },
          {
            title: "Diagnosis Pending",
            value: data.stats.pendingDiagnosis.toString(),
            change: "Pending review",
            icon: "ClipboardList" as const,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Today's Appointments",
            value: data.stats.todayAppointments.toString(),
            change: `${data.stats.todayCompleted} completed`,
            icon: "Calendar" as const,
            gradient: "from-purple-500 to-pink-500",
          },
          {
            title: "Critical Patients",
            value: data.stats.criticalPatients.toString(),
            change: "In ICU",
            icon: "AlertCircle" as const,
            gradient: "from-red-600 to-rose-600",
          },
        ];

        setStats(realStats);

        // Use real recovery data if available
        if (data.recoveryData && data.recoveryData.length > 0) {
          setRecoveryData(data.recoveryData.map((item: any) => ({
            day: item.day,
            rate: typeof item.rate === 'string' ? parseFloat(item.rate) : item.rate
          })));
        }

        // Use real appointments trend if available
        if (data.appointmentsTrend && data.appointmentsTrend.length > 0) {
          setAppointmentsTrend(data.appointmentsTrend.map((item: any) => ({
            time: `${item.hour} ${item.hour < 12 ? 'AM' : 'PM'}`,
            count: typeof item.count === 'string' ? parseInt(item.count) : item.count
          })));
        }
      }
      // If no data, keep using static data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
    Activity,
    ClipboardList,
    Calendar,
    AlertCircle,
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
        {/* Patient Recovery Rate */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Patient Recovery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={recoveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointments Trend */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Appointments Today</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg border-none md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recent Alerts & Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem 
              title="Lab results ready for Patient #1234"
              time="10 minutes ago"
              type="success"
            />
            <ActivityItem 
              title="Emergency: Patient #5678 vitals unstable"
              time="30 minutes ago"
              type="error"
            />
            <ActivityItem 
              title="New consultation request from Reception"
              time="1 hour ago"
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
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
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
