import axios from 'axios';

// Detect environment to use correct backend URL
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// export const API_BASE_URL = 'http://localhost:5001/api'


// export const UPLOADS_BASE_URL =  'http://localhost:5001'





export const UPLOADS_BASE_URL = 'https://dogzshow.onrender.com'
export const API_BASE_URL = 'https://dogzshow.onrender.com/api'
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${UPLOADS_BASE_URL}${url}`;
};

export default api;
