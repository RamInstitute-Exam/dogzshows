import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    console.warn('⚠️ NEXT_PUBLIC_API_URL is missing in .env.local. Defaulting to local dev server.');
  }
  return url || 'http://127.0.0.1:5001/api/v1';
};

// ── Instance ───────────────────────────────────────────────────────────────
export const axiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Cache for in-flight GET requests to prevent duplicate concurrent network calls
const inflightPromises = new Map<string, Promise<any>>();

// ── Interceptors ───────────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (req: InternalAxiosRequestConfig) => {
    // 1. Attach auth token automatically
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        req.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // 2. Development logging for DevTools visibility
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 [API Request] ${req.method?.toUpperCase()} ${req.baseURL}${req.url}`);
    }
    
    return req;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ [API Response] ${res.config.method?.toUpperCase()} ${res.config.url}`, res.data);
    }
    return res;
  },
  (error: AxiosError | any) => {
    if (axios.isCancel(error) || error?.name === 'AbortError' || error?.message === 'canceled') {
      return Promise.reject(error);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
    }

    if (error.response) {
      const status  = error.response.status;
      const data: any = error.response.data;
      const message = data?.message || data?.error || 'An error occurred';

      if (status === 401) {
        const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (hasToken) {
            toast.error('Session expired. Please log in again.');
            window.location.href = '/login';
          }
        }
      } else if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// ── Centralized API Wrapper ────────────────────────────────────────────────
export const api = {
  get: async <T = any>(url: string, params?: any): Promise<T> => {
    const key = `${url}:${JSON.stringify(params ?? {})}`;

    if (inflightPromises.has(key)) {
      return inflightPromises.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const response = await axiosInstance.get<T>(url, { params });
        return response.data;
      } finally {
        setTimeout(() => {
          inflightPromises.delete(key);
        }, 500);
      }
    })();

    inflightPromises.set(key, promise);
    return promise;
  },
  
  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },
  
  put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },
  
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },
  
  delete: async <T = any>(url: string, config?: any): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  }
};

export default api;
