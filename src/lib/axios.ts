import axios from 'axios';
import { config } from './config';
import { toast } from 'sonner';

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (req) => {
    // Attempt to attach token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        req.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // Global Error Handling
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.message || data?.error || 'An error occurred';

      if (status === 401) {
        // Auto-logout on 401
        toast.error('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } else if (status >= 400 && status < 500) {
        // Bad Requests, Not Found, etc
        toast.error(message);
      } else if (status >= 500) {
        // Server Errors
        toast.error('Server error: ' + message);
      }
    } else if (error.request) {
      // Network errors
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Unexpected error: ' + error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
