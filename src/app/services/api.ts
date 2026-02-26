import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-cca17b23/api`;

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'driver';
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface DeliveryResponse {
  message: string;
  delivery: any;
  otp?: string;
}

interface DeliveriesResponse {
  deliveries: any[];
}

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`API Error on ${endpoint}:`, data);
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name: string, role: 'admin' | 'driver'): Promise<AuthResponse> => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Delivery API
export const deliveryAPI = {
  start: async (data: {
    before_photo: string;
    warehouse_latitude: number;
    warehouse_longitude: number;
    delivery_address: string;
  }): Promise<DeliveryResponse> => {
    return apiCall('/deliveries/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  complete: async (data: {
    delivery_id: string;
    after_photo: string;
    delivery_latitude: number;
    delivery_longitude: number;
  }): Promise<DeliveryResponse> => {
    return apiCall('/deliveries/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyOTP: async (delivery_id: string, otp: string): Promise<{ message: string }> => {
    return apiCall('/deliveries/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ delivery_id, otp }),
    });
  },

  getAll: async (): Promise<DeliveriesResponse> => {
    return apiCall('/deliveries', {
      method: 'GET',
    });
  },

  resolve: async (id: string): Promise<{ message: string }> => {
    return apiCall(`/deliveries/${id}/resolve`, {
      method: 'PATCH',
    });
  },

  dispute: async (id: string): Promise<{ message: string }> => {
    return apiCall(`/deliveries/${id}/dispute`, {
      method: 'PATCH',
    });
  },
};
