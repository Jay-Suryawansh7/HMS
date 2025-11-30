import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Pill, UserPlus, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  {
    title: "Patients Assigned",
    value: "15",
    change: "Ward A & B",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Vitals Pending",
    value: "4",
    change: "Due in 30 mins",
    icon: Activity,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Medication Due",
    value: "8",
    change: "Next round at 2 PM",
    icon: Pill,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "New Admissions",
    value: "3",
    change: "Since shift start",
    icon: UserPlus,
    gradient: "from-purple-500 to-pink-500",
  },
];

const vitalsData = [
  { time: '8 AM', count: 15 },
  { time: '10 AM', count: 12 },
  { time: '12 PM', count: 14 },
  { time: '2 PM', count: 8 },
  { time: '4 PM', count: 10 },
];

export function NurseDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
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
        {/* Vitals Check Schedule */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Vitals Check Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem 
              title="Administer antibiotics to Bed 12"
              time="Due now"
              type="urgent"
            />
            <ActivityItem 
              title="Check vitals for Patient #456"
              time="15 mins ago"
              type="completed"
            />
            <ActivityItem 
              title="Dr. Jones requested update on Bed 5"
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
