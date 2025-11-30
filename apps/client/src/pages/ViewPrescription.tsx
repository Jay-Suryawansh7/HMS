import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, User, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { getPrescription, type Prescription } from '@/services/prescriptionService';
import { toast } from 'sonner';

export default function ViewPrescription() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPrescription(id);
    }
  }, [id]);

  const fetchPrescription = async (prescriptionId: string) => {
    try {
      setLoading(true);
      const data = await getPrescription(prescriptionId);
      setPrescription(data);
    } catch (error) {
      console.error('Failed to fetch prescription:', error);
      toast.error('Failed to load prescription details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading prescription details...</p>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-xl font-semibold">Prescription not found</p>
        <Button onClick={() => navigate('/dashboard/prescriptions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Prescriptions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" onClick={() => navigate('/dashboard/prescriptions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Prescription
        </Button>
      </div>

      {/* Prescription Card */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="border-b pb-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Medical Prescription</CardTitle>
              <CardDescription className="mt-1">
                ID: <span className="font-mono font-medium text-foreground">{prescription.prescriptionId}</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {prescription.createdAt ? format(new Date(prescription.createdAt), 'MMM dd, yyyy') : 'N/A'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          
          {/* Doctor & Patient Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Doctor Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="h-4 w-4" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Doctor</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-lg font-medium">{prescription.doctorName || 'Unknown Doctor'}</p>
                <p className="text-sm text-muted-foreground">General Physician</p> {/* You might want to fetch doctor specialization later */}
              </div>
            </div>

            {/* Patient Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Patient</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-lg font-medium">{prescription.patientName || 'Unknown Patient'}</p>
                <p className="text-sm text-muted-foreground">Patient ID: {prescription.patientId}</p>
              </div>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">Rx</span>
              Medicines
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold">Medicine Name</TableHead>
                    <TableHead className="font-semibold">Dosage</TableHead>
                    <TableHead className="font-semibold">Frequency</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Instructions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescription.medicines && prescription.medicines.length > 0 ? (
                    prescription.medicines.map((med, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{med.medicineName}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>{med.duration}</TableCell>
                        <TableCell className="text-muted-foreground italic">
                          {med.instructions || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No medicines listed.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Notes Section */}
          {prescription.notes && (
            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Additional Notes</h3>
              <p className="text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border">
                {prescription.notes}
              </p>
            </div>
          )}

          {/* Footer Signature Area (for print) */}
          <div className="hidden print:flex justify-between items-end pt-20 mt-10 border-t">
            <div className="text-sm text-muted-foreground">
              <p>Generated on {format(new Date(), 'PPP')}</p>
              <p>Hospital Management System</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-black mb-2"></div>
              <p className="text-sm font-medium">Doctor's Signature</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
