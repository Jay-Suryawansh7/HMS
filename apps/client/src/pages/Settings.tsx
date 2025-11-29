import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function Settings() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Staff Form State
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DOCTOR',
  });

  // Assign Task Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
  });

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE') {
      fetchStaff();
    }
  }, [user]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setStaffList(data.staff);
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/staff/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(staffForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add staff');
      }

      setMessage({ type: 'success', text: 'Staff member added successfully' });
      setStaffForm({ name: '', email: '', password: '', role: 'DOCTOR' });
      fetchStaff(); // Refresh the list
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/tasks/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign task');
      }

      setMessage({ type: 'success', text: 'Task assigned successfully' });
      setTaskForm({ title: '', description: '', assignedTo: '' });
    } catch (error: any) {
      // Original: setMessage({ type: 'error', text: error.message });
      toast.error('Failed to assign task'); // Changed as per instruction
    } finally {
      setLoading(false);
    }
  };

  const handleForcePasswordChange = async (userId: number) => {
    if (!confirm('Are you sure you want to force this user to change their password on next login?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/staff/${userId}/force-password-change`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('User will be required to change password on next login');
      } else {
        toast.error('Failed to force password change');
      }
    } catch (error) {
      console.error('Force password change error:', error);
      toast.error('An error occurred');
    }
  };

  if (!user) return null;

  // Added loading state check as per instruction, assuming a simple message for now
  if (loading && staffList.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p>Loading staff data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <AlertTitle>{message.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Admin View: Add Staff */}
      {user.role === 'ADMIN' && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Staff</CardTitle>
            <CardDescription>Create a new account for a staff member.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={staffForm.role}
                  onValueChange={(value) => setStaffForm({ ...staffForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="NURSE">Nurse</SelectItem>
                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                    <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Staff'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Doctor/Nurse View: Assign Task */}
      {(user.role === 'DOCTOR' || user.role === 'NURSE') && (
        <Card>
          <CardHeader>
            <CardTitle>Assign Task</CardTitle>
            <CardDescription>Assign a task to another staff member.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignTask} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select
                  value={taskForm.assignedTo}
                  onValueChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                    <SelectContent>
                    {staffList
                      .filter((staff) => {
                        // Admin cannot be assigned tasks via this form (usually)
                        if (staff.role === 'ADMIN') return false;
                        
                        // Nurse can ONLY assign to Receptionist
                        if (user.role === 'NURSE') {
                          return staff.role === 'RECEPTIONIST';
                        }
                        
                        // Doctor can assign to anyone (except Admin, filtered above)
                        // Optionally exclude themselves if needed, but "other staff" usually implies everyone else.
                        // Let's exclude the current user to be safe if "other staff" is strict.
                        if (staff.id === user.id) return false;

                        return true;
                      })
                      .map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.name} ({staff.role})
                      </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Task'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Staff Directory - Visible to Admin, Doctor, Nurse */}
      {(user.role === 'ADMIN' || user.role === 'DOCTOR' || user.role === 'NURSE') && (
        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>View staff members with lower roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    {user.role === 'ADMIN' && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffList
                    .filter((staff) => {
                      const ROLE_LEVELS: Record<string, number> = {
                        ADMIN: 0,
                        DOCTOR: 1,
                        NURSE: 2,
                        RECEPTIONIST: 3,
                        PHARMACIST: 3,
                        STAFF: 3,
                      };
                      
                      const currentUserLevel = ROLE_LEVELS[user.role] ?? 99;
                      const staffLevel = ROLE_LEVELS[staff.role] ?? 99;

                      // Show only if staff has a strictly lower role (higher level number)
                      return staffLevel > currentUserLevel;
                    })
                    .map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{staff.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={staff.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {staff.status}
                          </Badge>
                        </TableCell>
                        {user.role === 'ADMIN' && (
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleForcePasswordChange(staff.id)}
                            >
                              Force Password Change
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  {staffList.filter((staff) => {
                      const ROLE_LEVELS: Record<string, number> = {
                        ADMIN: 0,
                        DOCTOR: 1,
                        NURSE: 2,
                        RECEPTIONIST: 3,
                        PHARMACIST: 3,
                        STAFF: 3,
                      };
                      const currentUserLevel = ROLE_LEVELS[user.role] ?? 99;
                      const staffLevel = ROLE_LEVELS[staff.role] ?? 99;
                      return staffLevel > currentUserLevel;
                  }).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={user.role === 'ADMIN' ? 5 : 4} className="h-24 text-center">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
