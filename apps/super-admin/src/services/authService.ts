const API_URL = import.meta.env.VITE_API_URL || 'https://hms-server-944g.onrender.com/api';

export interface LoginCredentials {
  email: string;
  password: string;
  hospitalId: string;
}

export interface SignupData {
  hospitalName: string;
  subdomain: string;
  adminEmail: string;
  adminName: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    hospitalName: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface SignupResponse {
  message: string;
  hospitalId: string;
  tenantId: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  },

  signup: async (data: SignupData): Promise<SignupResponse> => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  },
};
