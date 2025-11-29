import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Search, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { PatientTable } from '@/components/patients/PatientTable';
import { exportPatients, type PatientSearchParams } from '@/services/patientService';

export function Patients() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<PatientSearchParams>({
    search: '',
    patientType: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleSearch = (value: string) => {
    setSearchParams((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handlePatientTypeChange = (value: string) => {
    setSearchParams((prev) => ({ 
      ...prev, 
      patientType: value === 'all' ? '' : value as 'OPD' | 'IPD',
      page: 1 
    }));
  };

  const handleDateFromChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, dateFrom: value, page: 1 }));
  };

  const handleDateToChange = (value: string) => {
    setSearchParams((prev) => ({ ...prev, dateTo: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const blob = await exportPatients(searchParams);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Patients exported successfully');
    } catch (error: any) {
      console.error('Error exporting patients:', error);
      toast.error('Failed to export patients', {
        description: error.response?.data?.message || 'An error occurred',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchParams({
      search: '',
      patientType: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 20,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground">Manage and view all patient records</p>
        </div>
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate('/dashboard/patients/register')}
        >
          <Plus className="mr-2 h-4 w-4" /> Register Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, or patient ID..."
              className="pl-10 h-12 text-lg"
              value={searchParams.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Patient Type Filter */}
            <Select
              value={searchParams.patientType || 'all'}
              onValueChange={handlePatientTypeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Patient Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="OPD">OPD</SelectItem>
                <SelectItem value="IPD">IPD</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Input
                type="date"
                className="w-[160px]"
                value={searchParams.dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <Input
                type="date"
                className="w-[160px]"
                value={searchParams.dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
              />
            </div>

            {/* Clear Filters Button */}
            {(searchParams.search || searchParams.patientType || searchParams.dateFrom || searchParams.dateTo) && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}

            {/* Export Button */}
            <div className="ml-auto">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>Exporting...</>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Patient Table */}
      <PatientTable searchParams={searchParams} onPageChange={handlePageChange} />
    </div>
  );
}
