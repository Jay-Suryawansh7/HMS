import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  {
    title: "Total Patients",
    value: "1,234",
    change: "+20.1% from last month",
    icon: Users,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Appointments",
    value: "+573",
    change: "+201 since last hour",
    icon: Calendar,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Active Doctors",
    value: "42",
    change: "+2 new this week",
    icon: Activity,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Revenue",
    value: "$45,231.89",
    change: "+19% from last month",
    icon: DollarSign,
    gradient: "from-orange-500 to-red-500",
  },
];

const patientGrowthData = [
  { month: 'Jan', patients: 890 },
  { month: 'Feb', patients: 950 },
  { month: 'Mar', patients: 1020 },
  { month: 'Apr', patients: 1100 },
  { month: 'May', patients: 1180 },
  { month: 'Jun', patients: 1234 },
];

const appointmentsData = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 49 },
  { day: 'Thu', count: 63 },
  { day: 'Fri', count: 58 },
  { day: 'Sat', count: 35 },
  { day: 'Sun', count: 28 },
];

const departmentData = [
  { name: 'Cardiology', value: 320, color: '#3b82f6' },
  { name: 'Neurology', value: 280, color: '#8b5cf6' },
  { name: 'Orthopedics', value: 250, color: '#10b981' },
  { name: 'Pediatrics', value: 200, color: '#f59e0b' },
  { name: 'Others', value: 184, color: '#6b7280' },
];

export function AdminDashboard() {
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
