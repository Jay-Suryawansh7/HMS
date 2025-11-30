import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, UserCheck, Clock } from "lucide-react";
import { getReceptionistDashboardStats } from "@/services/dashboardService";
import { STATIC_RECEPTIONIST_DATA } from "@/utils/staticData";

export function ReceptionistDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(STATIC_RECEPTIONIST_DATA.stats);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getReceptionistDashboardStats();
      
      if (data.hasData) {
        // Use real data
        const realStats = [
          {
            title: "Today's Check-ins",
            value: data.stats.todayCheckIns.toString(),
            change: "New registrations",
            icon: "Users" as const,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Today's Appointments",
            value: data.stats.todayAppointments.toString(),
            change: "Scheduled today",
            icon: "Calendar" as const,
            gradient: "from-green-500 to-emerald-500",
          },
          {
            title: "Pending Appointments",
            value: data.stats.pendingAppointments.toString(),
            change: "Awaiting confirmation",
            icon: "Calendar" as const,
            gradient: "from-purple-500 to-pink-500",
          },
        ];

        setStats(realStats);
      }
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

  const iconMap = {
    Calendar,
    Users,
    UserCheck,
    Clock,
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActivityItem 
            title="New appointment scheduled"
            time="5 mins ago"
            type="new"
          />
          <ActivityItem 
            title="Patient check-in completed"
            time="20 mins ago"
            type="completed"
          />
          <ActivityItem 
            title="Appointment confirmation pending"
            time="1 hour ago"
            type="pending"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityItem({ title, time, type }: { title: string; time: string; type: string }) {
  const colors = {
    new: 'bg-blue-500',
    pending: 'bg-yellow-500',
    completed: 'bg-green-500',
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
