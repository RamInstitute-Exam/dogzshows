import axiosInstance from './axios';

// Cache for in-flight GET requests to prevent duplicate concurrent network calls
const inflightPromises = new Map<string, Promise<any>>();

export const api = {
  get: async <T = any>(url: string, params?: any): Promise<T> => {
    const key = `${url}:${JSON.stringify(params ?? {})}`;

    if (inflightPromises.has(key)) {
      return inflightPromises.get(key) as Promise<T>;
    }

    const promise = (async () => {
      try {
        const finalParams = { ...params, _cb: Date.now() };
        const response = await axiosInstance.get<T>(url, { params: finalParams });
        return response.data;
      } finally {
        // Remove from cache after 500ms to allow deduplication of closely timed parallel requests
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
  delete: async <T = any>(url: string): Promise<T> => {
    const response = await axiosInstance.delete<T>(url);
    return response.data;
  }
};

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '/images/placeholder.webp';
  // Full URLs (S3, CDN, etc) pass through directly
  if (path.startsWith('http') || path.startsWith('/images/') || path.startsWith('data:')) return path;

  // If path is just a key, construct the S3 URL
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || process.env.AWS_BUCKET_NAME || 'juzdog-media';
  const region = process.env.NEXT_PUBLIC_S3_REGION || process.env.AWS_REGION || 'ap-south-1';
  
  // Clean up any leading slashes or 'uploads/' prefix if they were saved incorrectly
  const cleanPath = path.replace(/^\/+/, '').replace(/^uploads\//, '');
  
  return `https://${bucket}.s3.${region}.amazonaws.com/${cleanPath}`;
};

export default api;
