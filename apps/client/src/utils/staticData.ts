// Static/Demo data for dashboards when no real data exists

export const STATIC_ADMIN_DATA = {
  stats: [
    {
      title: "Total Patients",
      value: "1,234",
      change: "+20.1% from last month",
      icon: "Users" as const,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Appointments",
      value: "+573",
      change: "+201 since last hour",
      icon: "Calendar" as const,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Active Doctors",
      value: "42",
      change: "+2 new this week",
      icon: "Activity" as const,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Revenue",
      value: "$45,231.89",
      change: "+19% from last month",
      icon: "DollarSign" as const,
      gradient: "from-orange-500 to-red-500",
    },
  ],
  patientGrowthData: [
    { month: 'Jan', patients: 890 },
    { month: 'Feb', patients: 950 },
    { month: 'Mar', patients: 1020 },
    { month: 'Apr', patients: 1100 },
    { month: 'May', patients: 1180 },
    { month: 'Jun', patients: 1234 },
  ],
  appointmentsData: [
    { day: 'Mon', count: 45 },
    { day: 'Tue', count: 52 },
    { day: 'Wed', count: 49 },
    { day: 'Thu', count: 63 },
    { day: 'Fri', count: 58 },
    { day: 'Sat', count: 35 },
    { day: 'Sun', count: 28 },
  ],
  departmentData: [
    { name: 'Cardiology', value: 320, color: '#3b82f6' },
    { name: 'Neurology', value: 280, color: '#8b5cf6' },
    { name: 'Orthopedics', value: 250, color: '#10b981' },
    { name: 'Pediatrics', value: 200, color: '#f59e0b' },
    { name: 'Others', value: 184, color: '#6b7280' },
  ],
};

export const STATIC_DOCTOR_DATA = {
  stats: [
    {
      title: "Pending Surgeries",
      value: "3",
      change: "Scheduled for today",
      icon: "Activity" as const,
      gradient: "from-red-500 to-orange-500",
    },
    {
      title: "Diagnosis Pending",
      value: "12",
      change: "+4 since morning",
      icon: "ClipboardList" as const,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Today's Appointments",
      value: "28",
      change: "8 completed",
      icon: "Calendar" as const,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Critical Patients",
      value: "5",
      change: "In ICU",
      icon: "AlertCircle" as const,
      gradient: "from-red-600 to-rose-600",
    },
  ],
  recoveryData: [
    { day: 'Mon', rate: 85 },
    { day: 'Tue', rate: 88 },
    { day: 'Wed', rate: 82 },
    { day: 'Thu', rate: 90 },
    { day: 'Fri', rate: 95 },
    { day: 'Sat', rate: 92 },
    { day: 'Sun', rate: 94 },
  ],
  appointmentsTrend: [
    { time: '9 AM', count: 4 },
    { time: '10 AM', count: 6 },
    { time: '11 AM', count: 5 },
    { time: '12 PM', count: 3 },
    { time: '1 PM', count: 2 },
    { time: '2 PM', count: 5 },
    { time: '3 PM', count: 7 },
    { time: '4 PM', count: 4 },
  ],
};

export const STATIC_NURSE_DATA = {
  stats: [
    {
      title: "Assigned Patients",
      value: "18",
      change: "+3 since morning",
      icon: "Users" as const,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Pending Tasks",
      value: "7",
      change: "2 high priority",
      icon: "ClipboardList" as const,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Critical Alerts",
      value: "3",
      change: "Requires immediate attention",
      icon: "AlertCircle" as const,
      gradient: "from-red-500 to-rose-500",
    },
    {
      title: "Medications Due",
      value: "12",
      change: "Next hour",
      icon: "Pill" as const,
      gradient: "from-green-500 to-emerald-500",
    },
  ],
};

export const STATIC_RECEPTIONIST_DATA = {
  stats: [
    {
      title: "Today's Check-ins",
      value: "24",
      change: "+8 since morning",
      icon: "UserCheck" as const,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Pending Appointments",
      value: "15",
      change: "Waiting confirmation",
      icon: "Clock" as const,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Total Appointments",
      value: "42",
      change: "Today",
      icon: "Calendar" as const,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Waiting Patients",
      value: "8",
      change: "In queue",
      icon: "Users" as const,
      gradient: "from-orange-500 to-red-500",
    },
  ],
};

export const STATIC_PHARMACIST_DATA = {
  stats: [
    {
      title: "Pending Prescriptions",
      value: "14",
      change: "+5 today",
      icon: "FileText" as const,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Dispensed Today",
      value: "28",
      change: "Updated 5 min ago",
      icon: "CheckCircle" as const,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Low Stock Items",
      value: "6",
      change: "Requires attention",
      icon: "AlertTriangle" as const,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Inventory Value",
      value: "$23,456",
      change: "Total stock",
      icon: "DollarSign" as const,
      gradient: "from-purple-500 to-pink-500",
    },
  ],
};

