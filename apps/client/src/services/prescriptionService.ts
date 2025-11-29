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

export interface MedicineItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: number;
  prescriptionId: string;
  doctorId: number;
  patientId: number;
  notes?: string;
  createdAt: string;
  medicines?: MedicineItem[];
  doctorName?: string;
  patientName?: string;
}

export interface PrescriptionListResponse {
  data: Prescription[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface CreatePrescriptionData {
  patientId: number;
  notes?: string;
  medicines: MedicineItem[];
}

export interface PrescriptionSearchParams {
  patientId?: number;
  doctorId?: number;
  page?: number;
  limit?: number;
}

/**
 * Create a new prescription
 */
export const createPrescription = async (data: CreatePrescriptionData): Promise<any> => {
  const response = await apiClient.post('/prescriptions', data);
  return response.data;
};

/**
 * List/search prescriptions
 */
export const listPrescriptions = async (params: PrescriptionSearchParams = {}): Promise<PrescriptionListResponse> => {
  const response = await apiClient.get('/prescriptions', { params });
  return response.data;
};

/**
 * Get a single prescription
 */
export const getPrescription = async (id: string): Promise<Prescription> => {
  const response = await apiClient.get(`/prescriptions/${id}`);
  return response.data;
};
