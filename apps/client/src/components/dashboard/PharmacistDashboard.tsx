import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, AlertTriangle, ShoppingCart, ClipboardList, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = [
  {
    title: "Pending Prescriptions",
    value: "18",
    change: "Urgent: 3",
    icon: ClipboardList,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Low Stock Items",
    value: "5",
    change: "Reorder needed",
    icon: AlertTriangle,
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Expiring Medicines",
    value: "12",
    change: "Within 30 days",
    icon: Pill,
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    title: "Today's Sales",
    value: "$1,250",
    change: "+12% vs yesterday",
    icon: ShoppingCart,
    gradient: "from-green-500 to-emerald-500",
  },
];

const salesData = [
  { time: '9 AM', amount: 120 },
  { time: '10 AM', amount: 250 },
  { time: '11 AM', amount: 180 },
  { time: '12 PM', amount: 300 },
  { time: '1 PM', amount: 150 },
  { time: '2 PM', amount: 200 },
  { time: '3 PM', amount: 280 },
  { time: '4 PM', amount: 220 },
];

export function PharmacistDashboard() {
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
        {/* Sales Trend */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Hourly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActivityItem 
              title="Prescription #1234 - Amoxicillin"
              time="2 mins ago"
              type="new"
            />
            <ActivityItem 
              title="Stock check: Paracetamol"
              time="1 hour ago"
              type="completed"
            />
            <ActivityItem 
              title="Expiry check for batch #998"
              time="2 hours ago"
              type="pending"
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
    completed: 'bg-green-500',
    pending: 'bg-yellow-500',
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
