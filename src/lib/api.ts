import axiosInstance from './axios';

export const api = {
  get: async <T = any>(url: string, params?: any): Promise<T> => {
    const response = await axiosInstance.get<T>(url, { params });
    return response.data;
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
  delete: async <T = any>(url: string): Promise<T> => {
    const response = await axiosInstance.delete<T>(url);
    return response.data;
  }
};

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '/images/placeholder.webp';
  if (path.startsWith('http') || path.startsWith('/images/') || path.startsWith('data:')) return path;

  const uploadUrl = process.env.NEXT_PUBLIC_UPLOAD_URL || 'https://s3.ap-south-1.amazonaws.com/namma-orru-foods/images';
  return `${uploadUrl}/${path.replace(/^\//, '')}`;
};

export default api;
