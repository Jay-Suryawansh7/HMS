import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hms-server-944g.onrender.com/api';

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

// TypeScript interfaces for dashboard statistics

export interface AdminDashboardStats {
  hasData: boolean;
  stats: {
    totalPatients: number;
    totalAppointments: number;
    activeDoctors: number;
    revenue: number | null;
  };
  patientGrowthData: Array<{ month: string; patients: number }>;
  appointmentsData: Array<{ day: string; count: number }>;
}

export interface DoctorDashboardStats {
  hasData: boolean;
  stats: {
    pendingSurgeries: number;
    pendingDiagnosis: number;
    todayAppointments: number;
    todayCompleted: number;
    criticalPatients: number;
  };
  recoveryData: Array<{ day: string; rate: number }>;
  appointmentsTrend: Array<{ hour: number; count: number }>;
}

export interface NurseDashboardStats {
  hasData: boolean;
  stats: {
    assignedTasks: number;
    criticalAlerts: number;
    assignedPatients: number;
  };
}

export interface ReceptionistDashboardStats {
  hasData: boolean;
  stats: {
    todayCheckIns: number;
    todayAppointments: number;
    pendingAppointments: number;
  };
}

export interface PharmacistDashboardStats {
  hasData: boolean;
  stats: {
    pendingPrescriptions: number;
    todayDispensed: number;
    totalPrescriptions: number;
  };
}

/**
 * Get Admin Dashboard Statistics
 */
export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const response = await apiClient.get('/dashboard/admin');
  return response.data;
};

/**
 * Get Doctor Dashboard Statistics
 */
export const getDoctorDashboardStats = async (): Promise<DoctorDashboardStats> => {
  const response = await apiClient.get('/dashboard/doctor');
  return response.data;
};

/**
 * Get Nurse Dashboard Statistics
 */
export const getNurseDashboardStats = async (): Promise<NurseDashboardStats> => {
  const response = await apiClient.get('/dashboard/nurse');
  return response.data;
};

/**
 * Get Receptionist Dashboard Statistics
 */
export const getReceptionistDashboardStats = async (): Promise<ReceptionistDashboardStats> => {
  const response = await apiClient.get('/dashboard/receptionist');
  return response.data;
};

/**
 * Get Pharmacist Dashboard Statistics
 */
export const getPharmacistDashboardStats = async (): Promise<PharmacistDashboardStats> => {
  const response = await apiClient.get('/dashboard/pharmacist');
  return response.data;
};
