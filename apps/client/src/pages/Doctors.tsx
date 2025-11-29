import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";

const appointments = [
  { id: 1, patient: "Alice Brown", time: "09:00 AM", type: "Checkup" },
  { id: 2, patient: "Charlie Davis", time: "10:30 AM", type: "Follow-up" },
  { id: 3, patient: "Eve Wilson", time: "02:00 PM", type: "Consultation" },
];

export function Doctors() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctor Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4" />
                    {apt.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <button className="w-full p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <span className="font-medium block">View Patient History</span>
              <span className="text-sm text-muted-foreground">Search and view records</span>
            </button>
            <button className="w-full p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors">
              <span className="font-medium block">Prescribe Medication</span>
              <span className="text-sm text-muted-foreground">Create new prescription</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
