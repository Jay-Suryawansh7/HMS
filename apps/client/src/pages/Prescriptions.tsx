import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, Eye } from 'lucide-react';
import { listPrescriptions, type Prescription } from '@/services/prescriptionService';
import { toast } from 'sonner';

export default function Prescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPrescriptions();
  }, [page]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await listPrescriptions({ page, limit: 20 });
      setPrescriptions(response.data);
      setTotalPages(response.meta.lastPage);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">Manage and view patient prescriptions</p>
        </div>
        <Button onClick={() => navigate('/dashboard/prescriptions/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Prescription
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Prescriptions</CardTitle>
          <CardDescription>A list of all prescriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Loading prescriptions...</p>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <p className="text-muted-foreground">No prescriptions found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard/prescriptions/create')}
              >
                Create your first prescription
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prescription ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription) => (
                      <TableRow key={prescription.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{prescription.prescriptionId}</Badge>
                        </TableCell>
                        <TableCell>{prescription.patientName || 'N/A'}</TableCell>
                        <TableCell>{prescription.doctorName || 'N/A'}</TableCell>
                        <TableCell>
                          {prescription.createdAt
                            ? format(new Date(prescription.createdAt), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dashboard/prescriptions/${prescription.prescriptionId}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
