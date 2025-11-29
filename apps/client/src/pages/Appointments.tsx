import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, Filter } from "lucide-react";
import axios from "axios";

interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  patient_name: string;
  doctor_name: string;
  time: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SCHEDULED" | "COMPLETED" | "CANCELLED">("ALL");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const hospitalId = localStorage.getItem("hospitalId");
      
      const response = await axios.get(`http://localhost:5001/api/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-hospital-id": hospitalId,
        },
      });
      
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = filter === "ALL" 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading appointments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border rounded-lg bg-background text-sm"
          >
            <option value="ALL">All Appointments</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No appointments found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {filter !== "ALL" ? `No ${filter.toLowerCase()} appointments` : "Start by creating a new appointment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((apt) => {
            const dateTime = formatDateTime(apt.time);
            return (
              <Card key={apt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <User className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{apt.patient_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Doctor:</span> {apt.doctor_name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>{dateTime.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>{dateTime.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
