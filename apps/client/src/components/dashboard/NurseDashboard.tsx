import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, ClipboardList, TrendingUp } from "lucide-react";
import { getNurseDashboardStats } from "@/services/dashboardService";
import { STATIC_NURSE_DATA } from "@/utils/staticData";

export function NurseDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(STATIC_NURSE_DATA.stats);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getNurseDashboardStats();
      
      if (data.hasData) {
        // Use real data
        const realStats = [
          {
            title: "Assigned Patients",
            value: data.stats.assignedPatients.toString(),
            change: "Current assignments",
            icon: "Users" as const,
            gradient: "from-blue-500 to-cyan-500",
          },
          {
            title: "Pending Tasks",
            value: data.stats.assignedTasks.toString(),
            change: "Requires attention",
            icon: "ClipboardList" as const,
            gradient: "from-purple-500 to-pink-500",
          },
          {
            title: "Critical Alerts",
            value: data.stats.criticalAlerts.toString(),
            change: "High priority",
            icon: "AlertCircle" as const,
            gradient: "from-red-500 to-rose-500",
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
    Users,
    ClipboardList,
    AlertCircle,
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
          <CardTitle className="text-lg">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ActivityItem 
            title="Check vitals for assigned patients"
            time="Due now"
            type="urgent"
          />
          <ActivityItem 
            title="Medication round completed"
            time="15 mins ago"
            type="completed"
          />
          <ActivityItem 
            title="Doctor requested update"
            time="1 hour ago"
            type="info"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityItem({ title, time, type }: { title: string; time: string; type: string }) {
  const colors = {
    urgent: 'bg-red-500',
    completed: 'bg-green-500',
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
