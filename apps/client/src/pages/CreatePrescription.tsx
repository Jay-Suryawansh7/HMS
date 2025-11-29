import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { createPrescription } from '@/services/prescriptionService';
import { listPatients, type Patient } from '@/services/patientService';

// Zod schema
const medicineSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  notes: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, 'At least one medicine is required'),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

export default function CreatePrescription() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      notes: '',
      medicines: [
        { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await listPatients({ limit: 1000 });
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      setSubmitting(true);
      await createPrescription({
        patientId: parseInt(data.patientId),
        notes: data.notes,
        medicines: data.medicines,
      });
      toast.success('Prescription created successfully');
      navigate('/dashboard/prescriptions');
    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Prescription</h1>
        <p className="text-muted-foreground">Create a new prescription for a patient</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Select the patient for this prescription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="patientId">Patient *</Label>
              <Select onValueChange={(value) => setValue('patientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {loadingPatients ? (
                    <SelectItem value="loading" disabled>
                      Loading patients...
                    </SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.firstName} {patient.lastName} - {patient.patientId}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.patientId && (
                <p className="text-sm text-red-500">{errors.patientId.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Add any additional notes or instructions..."
                {...register('notes')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Medicines</CardTitle>
                <CardDescription>Add medicines to the prescription</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Medicine {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor={`medicines.${index}.medicineName`}>Medicine Name *</Label>
                    <Input
                      {...register(`medicines.${index}.medicineName`)}
                      placeholder="e.g., Paracetamol"
                    />
                    {errors.medicines?.[index]?.medicineName && (
                      <p className="text-sm text-red-500">
                        {errors.medicines[index]?.medicineName?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`medicines.${index}.dosage`}>Dosage *</Label>
                    <Input
                      {...register(`medicines.${index}.dosage`)}
                      placeholder="e.g., 500mg"
                    />
                    {errors.medicines?.[index]?.dosage && (
                      <p className="text-sm text-red-500">
                        {errors.medicines[index]?.dosage?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`medicines.${index}.frequency`}>Frequency *</Label>
                    <Input
                      {...register(`medicines.${index}.frequency`)}
                      placeholder="e.g., 1-0-1 (Morning-Afternoon-Night)"
                    />
                    {errors.medicines?.[index]?.frequency && (
                      <p className="text-sm text-red-500">
                        {errors.medicines[index]?.frequency?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`medicines.${index}.duration`}>Duration *</Label>
                    <Input
                      {...register(`medicines.${index}.duration`)}
                      placeholder="e.g., 5 days"
                    />
                    {errors.medicines?.[index]?.duration && (
                      <p className="text-sm text-red-500">
                        {errors.medicines[index]?.duration?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor={`medicines.${index}.instructions`}>Instructions</Label>
                    <Input
                      {...register(`medicines.${index}.instructions`)}
                      placeholder="e.g., After food"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/prescriptions')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Prescription'}
          </Button>
        </div>
      </form>
    </div>
  );
}
