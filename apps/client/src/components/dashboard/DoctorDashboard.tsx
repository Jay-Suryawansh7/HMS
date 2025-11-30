import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, AlertCircle, TrendingUp, ClipboardList } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  {
    title: "Pending Surgeries",
    value: "3",
    change: "Scheduled for today",
    icon: Activity,
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Diagnosis Pending",
    value: "12",
    change: "+4 since morning",
    icon: ClipboardList,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Today's Appointments",
    value: "28",
    change: "8 completed",
    icon: Calendar,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Critical Patients",
    value: "5",
    change: "In ICU",
    icon: AlertCircle,
    gradient: "from-red-600 to-rose-600",
  },
];

const recoveryData = [
  { day: 'Mon', rate: 85 },
  { day: 'Tue', rate: 88 },
  { day: 'Wed', rate: 82 },
  { day: 'Thu', rate: 90 },
  { day: 'Fri', rate: 95 },
  { day: 'Sat', rate: 92 },
  { day: 'Sun', rate: 94 },
];

const appointmentsTrend = [
  { time: '9 AM', count: 4 },
  { time: '10 AM', count: 6 },
  { time: '11 AM', count: 5 },
  { time: '12 PM', count: 3 },
  { time: '1 PM', count: 2 },
  { time: '2 PM', count: 5 },
  { time: '3 PM', count: 7 },
  { time: '4 PM', count: 4 },
];

export function DoctorDashboard() {
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
