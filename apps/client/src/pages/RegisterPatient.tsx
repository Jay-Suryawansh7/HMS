import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUpload } from '@/components/patients/PhotoUpload';
import { registerPatient, getPatient, updatePatient } from '@/services/patientService';

// Validation schema
const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  bloodGroup: z.string().optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
  patientType: z.enum(['OPD', 'IPD']),
  admissionNotes: z.string().optional(),
  history: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export function RegisterPatient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      patientType: 'OPD',
      gender: undefined,
      dob: '',
      bloodGroup: '',
      email: '',
      address: '',
      history: '',
      admissionNotes: '',
    },
  });

  const patientType = watch('patientType');

  useEffect(() => {
    if (isEditMode) {
      loadPatient();
    }
  }, [id]);

  const loadPatient = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const patient = await getPatient(id);
      
      // Populate form
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dob && !isNaN(new Date(patient.dob).getTime()) ? new Date(patient.dob).toISOString().split('T')[0] : '',
        gender: patient.gender,
        bloodGroup: patient.bloodGroup || '',
        phone: patient.phone,
        email: patient.email || '',
        address: patient.address || '',
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        patientType: patient.patientType,
        history: patient.history || '',
      });

      if (patient.photoUrl) {
        setCurrentPhotoUrl(patient.photoUrl);
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      toast.error('Failed to load patient details');
      navigate('/dashboard/patients');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value as string);
        }
      });
      
      // Add photo if selected
      if (photo) {
        formData.append('photo', photo);
      }
      
      if (isEditMode && id) {
        await updatePatient(id, formData);
        toast.success('Patient updated successfully');
      } else {
        const response = await registerPatient(formData);
        toast.success(`Patient registered successfully!`, {
          description: `Patient ID: ${response.patientId}`,
          duration: 5000,
        });
      }
      
      // Navigate back to patients list
      navigate('/dashboard/patients');
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error(isEditMode ? 'Failed to update patient' : 'Failed to register patient', {
        description: error.response?.data?.message || 'An error occurred. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard/patients')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditMode ? 'Edit Patient' : 'Register Patient'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? 'Update patient details' : 'Enter patient details to create a new record'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          {/* Patient Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Type</CardTitle>
              <CardDescription>Select the type of patient admission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={patientType === 'OPD' ? 'default' : 'outline'}
                  className="h-20"
                  onClick={() => setValue('patientType', 'OPD')}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">OPD</div>
                    <div className="text-xs">Out-Patient Department</div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={patientType === 'IPD' ? 'destructive' : 'outline'}
                  className="h-20"
                  onClick={() => setValue('patientType', 'IPD')}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">IPD</div>
                    <div className="text-xs">In-Patient Department</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    {...register('dob')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    onValueChange={(value) => setValue('gender', value as any)}
                    value={watch('gender') || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input
                  id="bloodGroup"
                  {...register('bloodGroup')}
                  placeholder="e.g., O+, A-, B+, AB+"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="1234567890"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="123 Main Street, City, State, ZIP"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">
                    Contact Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emergencyContactName"
                    {...register('emergencyContactName')}
                    placeholder="Jane Doe"
                  />
                  {errors.emergencyContactName && (
                    <p className="text-sm text-red-500">{errors.emergencyContactName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">
                    Contact Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register('emergencyContactPhone')}
                    placeholder="0987654321"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-red-500">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Photo</CardTitle>
              <CardDescription>Upload a photo of the patient (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload 
                onChange={setPhoto} 
                // Pass current photo URL logic if PhotoUpload supports it, but for now just file input
              />
              {isEditMode && currentPhotoUrl && !photo && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Current Photo:</p>
                  <img 
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}${currentPhotoUrl}`} 
                    alt="Current" 
                    className="h-32 w-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* IPD Specific Fields */}
          {patientType === 'IPD' && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-700">IPD Admission Details</CardTitle>
                <CardDescription>Additional information for in-patient admission</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="admissionNotes">Admission Notes</Label>
                  <Input
                    id="admissionNotes"
                    {...register('admissionNotes')}
                    placeholder="Reason for admission, ward details, etc."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Previous medical conditions or relevant history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="history">History</Label>
                <Input
                  id="history"
                  {...register('history')}
                  placeholder="Hypertension, Diabetes, Allergies, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/patients')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Registering...'}
                </>
              ) : (
                isEditMode ? 'Update Patient' : 'Register Patient'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
