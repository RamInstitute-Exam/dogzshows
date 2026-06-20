import axios, { InternalAxiosRequestConfig } from 'axios';
import { config } from './config';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

// ── Instance ───────────────────────────────────────────────────────────────

const axiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Helper to check for mutation methods
function isMutationMethod(method?: string): boolean {
  return ['post', 'put', 'patch', 'delete'].includes((method ?? '').toLowerCase());
}

// ── Request interceptor ────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (req) => {
    // Attach auth token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        req.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ───────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // ── IMPORTANT: cancelled requests must exit immediately.
    // Do NOT retry, do NOT toast, do NOT log as an error.
    if (axios.isCancel(error) || error?.name === 'AbortError' || error?.message === 'canceled') {
      return Promise.reject(error);
    }

    // ── HTTP error handling ───────────────────────────────────────────────
    if (error.response) {
      const status  = error.response.status;
      const data    = error.response.data;
      const message = data?.message || data?.error || 'An error occurred';

      if (status === 401) {
        const hasToken =
          typeof window !== 'undefined' && !!localStorage.getItem('token');
        if (hasToken) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (status === 404) {
        // Optional CMS/config endpoints — not an error worth surfacing
        console.warn(`[404] Optional endpoint unavailable: ${error.config?.url}`);
      } else if (status === 408 || error.code === 'ECONNABORTED') {
        console.warn(`[Timeout] ${error.config?.url}`);
      } else if (status >= 400 && status < 500) {
        toast.error(message);
      } else if (status >= 500) {
        toast.error('Server error. Please try again.');
      }
    }
    // Network error (no response) — only show toast for user-initiated actions,
    // not for background fetches (suppress for GET requests)
    else if (error.request && isMutationMethod(error.config?.method)) {
      toast.error('Network error. Please check your connection.');
    }

    // ── Auto-retry: only for network errors or 500/502/503/504, only up to 2 attempts ──
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;
    
    const isServerError = status === 500 || status === 502 || status === 503 || status === 504;
    const isNetworkError = !error.response && error.request;

    const shouldRetry =
      originalRequest &&
      (isServerError || isNetworkError) &&
      (originalRequest._retryCount ?? 0) < 2;

    if (shouldRetry) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      console.log(`Retrying request (${originalRequest.url})... Attempt ${originalRequest._retryCount}`);

      return new Promise((resolve) =>
        setTimeout(() => resolve(axiosInstance(originalRequest)), originalRequest._retryCount! * 1000)
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
