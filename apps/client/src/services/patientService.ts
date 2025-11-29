import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Get tenant ID from localStorage
const getTenantId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.tenantId;
  }
  return null;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth headers
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  const tenantId = getTenantId();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (tenantId) {
    config.headers['x-tenant-id'] = tenantId;
  }
  
  return config;
});

export interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  phone: string;
  email?: string;
  address?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  patientType: 'OPD' | 'IPD';
  photoUrl?: string;
  history?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientListResponse {
  data: Patient[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface PatientSearchParams {
  search?: string;
  patientType?: 'OPD' | 'IPD' | '';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * Register a new patient
 */
export const registerPatient = async (formData: FormData): Promise<any> => {
  const response = await apiClient.post('/patients', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * List/search patients
 */
export const listPatients = async (params: PatientSearchParams = {}): Promise<PatientListResponse> => {
  const response = await apiClient.get('/patients', { params });
  return response.data;
};

/**
 * Export patients to CSV
 */
export const exportPatients = async (params: PatientSearchParams = {}): Promise<Blob> => {
  const response = await apiClient.get('/patients/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get a single patient
 */
export const getPatient = async (id: string): Promise<Patient> => {
  const response = await apiClient.get(`/patients/${id}`);
  return response.data;
};

/**
 * Update a patient
 */
export const updatePatient = async (id: string, formData: FormData): Promise<any> => {
  const response = await apiClient.put(`/patients/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete a patient
 */
export const deletePatient = async (id: string): Promise<void> => {
  await apiClient.delete(`/patients/${id}`);
};
