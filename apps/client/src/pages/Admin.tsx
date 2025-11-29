import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users as UsersIcon, Mail, Shield, AlertCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'https://hms-server-944g.onrender.com/api';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function Admin() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch staff');

      const data = await response.json();
      setStaffMembers(data.staff);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/staff/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, role, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add staff');
      }

      setSuccess('Staff member added successfully!');
      setName("");
      setEmail("");
      setRole("");
      setPassword("");
      
      // Refresh staff list
      await fetchStaff();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  const totalStaff = staffMembers.length;
  const adminCount = staffMembers.filter(s => s.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Staff Management</h1>
        <p className="text-muted-foreground mt-1">Manage your hospital staff and their roles</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatCard icon={UsersIcon} label="Total Staff" value={totalStaff.toString()} color="from-blue-500 to-cyan-500" />
        <StatCard icon={Shield} label="Administrators" value={adminCount.toString()} color="from-purple-500 to-pink-500" />
        <StatCard icon={Mail} label="Pending Invites" value="0" color="from-green-500 to-emerald-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Staff Form */}
        <Card className="shadow-lg border-none lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              Add New Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <span>✓ {success}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="staffName">Full Name</Label>
                <Input 
                  id="staffName" 
                  placeholder="Dr. Jane Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staffEmail">Email Address</Label>
                <Input 
                  id="staffEmail" 
                  type="email" 
                  placeholder="jane@hospital.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffRole">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="NURSE">Nurse</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffPassword">Temporary Password</Label>
                <Input 
                  id="staffPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Staff Member
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card className="shadow-lg border-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : staffMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No staff members yet. Add your first staff member above.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((staff) => (
                      <TableRow key={staff.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell className="text-muted-foreground">{staff.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(staff.role)}>
                            {staff.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1 text-sm">
                            <span className={`h-2 w-2 rounded-full ${staff.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            {staff.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "DOCTOR":
      return "default";
    case "NURSE":
      return "secondary";
    default:
      return "outline";
  }
}
