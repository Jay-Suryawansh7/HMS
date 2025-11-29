import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Edit, Loader2 } from 'lucide-react';
import { listPatients, type Patient, type PatientSearchParams } from '@/services/patientService';
import { format } from 'date-fns';

interface PatientTableProps {
  searchParams: PatientSearchParams;
  onPageChange: (page: number) => void;
}

export function PatientTable({ searchParams, onPageChange }: PatientTableProps) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    lastPage: 1,
  });

  useEffect(() => {
    loadPatients();
  }, [searchParams]);

  const loadPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await listPatients(searchParams);
      setPatients(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Error loading patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  const getAvatarUrl = (photoUrl?: string) => {
    if (!photoUrl) return null;
    // Assuming the backend serves files from /uploads
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://hms-server-944g.onrender.com';
    return `${baseUrl}${photoUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border bg-white p-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadPatients} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="rounded-md border bg-white p-8 text-center">
        <p className="text-muted-foreground">No patients found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-muted/20">
                <TableCell>
                  <Avatar>
                    <AvatarImage src={getAvatarUrl(patient.photoUrl) || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(patient.firstName, patient.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{patient.patientId}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                    {patient.email && (
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{patient.phone}</p>
                    {patient.emergencyContactName && (
                      <p className="text-muted-foreground text-xs">
                        Emergency: {patient.emergencyContactPhone}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={patient.patientType === 'IPD' ? 'destructive' : 'secondary'}>
                    {patient.patientType}
                  </Badge>
                </TableCell>
                <TableCell>{patient.bloodGroup || '-'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {patient.createdAt ? format(new Date(patient.createdAt), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/dashboard/patients/edit/${patient.patientId}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/dashboard/patients/edit/${patient.patientId}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta.lastPage > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} patients
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(meta.page - 1)}
              disabled={meta.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
                .filter(page => {
                  // Show first, last, current, and adjacent pages
                  return page === 1 || page === meta.lastPage || Math.abs(page - meta.page) <= 1;
                })
                .map((page, index, array) => (
                  <>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span key={`ellipsis-${page}`} className="px-2">...</span>
                    )}
                    <Button
                      key={page}
                      variant={page === meta.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </Button>
                  </>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(meta.page + 1)}
              disabled={meta.page === meta.lastPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
