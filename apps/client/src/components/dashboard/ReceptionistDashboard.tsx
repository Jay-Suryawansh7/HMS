import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Phone, UserPlus, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  {
    title: "Today's Appointments",
    value: "42",
    change: "+5 from yesterday",
    icon: Calendar,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Doctors Available",
    value: "8",
    change: "Out of 12",
    icon: Users,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "New Registrations",
    value: "15",
    change: "Since morning",
    icon: UserPlus,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Pending Inquiries",
    value: "6",
    change: "Needs follow-up",
    icon: Phone,
    gradient: "from-orange-500 to-red-500",
  },
];

const peakHoursData = [
  { time: '9 AM', visitors: 25 },
  { time: '10 AM', visitors: 40 },
  { time: '11 AM', visitors: 35 },
  { time: '12 PM', visitors: 20 },
  { time: '1 PM', visitors: 15 },
  { time: '2 PM', visitors: 30 },
  { time: '3 PM', visitors: 28 },
  { time: '4 PM', visitors: 22 },
];

export function ReceptionistDashboard() {
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
        {/* Peak Hours Chart */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Visitor Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="visitors" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem 
              title="Appointment request: Dr. Smith"
              time="5 mins ago"
              type="new"
            />
            <ActivityItem 
              title="Insurance query: Patient #789"
              time="20 mins ago"
              type="pending"
            />
            <ActivityItem 
              title="New patient registration completed"
              time="1 hour ago"
              type="completed"
            />
          </CardContent>
        </Card>
      </div>
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
