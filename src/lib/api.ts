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
  if (
    path.startsWith('http') ||
    path.startsWith('/images/') ||
    path.startsWith('data:') ||
    (path.startsWith('/') && !path.startsWith('/uploads/'))
  ) {
    return path;
  }

  // If path is just a key, construct the S3 URL
  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || process.env.AWS_BUCKET_NAME || 'juzdog-media';
  const region = process.env.NEXT_PUBLIC_S3_REGION || process.env.AWS_REGION || 'ap-south-1';
  
  // Clean up any leading slashes or 'uploads/' prefix if they were saved incorrectly
  const cleanPath = path.replace(/^\/+/, '').replace(/^uploads\//, '');
  
  const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;
  if (cdnDomain) {
    return `https://${cdnDomain}/${cleanPath}`;
  }
  
  return `https://${bucket}.s3.${region}.amazonaws.com/${cleanPath}`;
};

export const getThumbnailUrl = (path: string | undefined | null) => {
  const url = getImageUrl(path);
  if (!url) return '/images/placeholder.webp';

  // Support for both old (-preview.webp) and new (-medium.webp) file names
  if (url.includes('-preview.webp')) {
    return url.replace('-preview.webp', '-thumb.webp'); // Old generated format
  }
  if (url.includes('-medium.webp')) {
    return url.replace('-medium.webp', '-thumbnail.webp'); // New generated format
  }
  if (url.includes('-original.webp')) {
    return url.replace('-original.webp', '-thumbnail.webp');
  }
  
  return url;
};

export const getOriginalUrl = (path: string | undefined | null) => {
  const url = getImageUrl(path);
  if (!url) return '/images/placeholder.webp';

  if (url.includes('-preview.webp')) {
    return url.replace('-preview.webp', '-original.webp');
  }
  if (url.includes('-medium.webp')) {
    return url.replace('-medium.webp', '-original.webp');
  }
  if (url.includes('-thumb.webp')) {
    return url.replace('-thumb.webp', '-original.webp');
  }
  if (url.includes('-thumbnail.webp')) {
    return url.replace('-thumbnail.webp', '-original.webp');
  }
  
  return url;
};

export const getOptimizedUrl = (path: string | undefined | null, width: number = 800) => {
  const url = getImageUrl(path);
  // Bypass optimization in development or for local development servers
  if (
    process.env.NODE_ENV === 'development' ||
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('192.168.') ||
    url.includes('0.0.0.0')
  ) {
    return url;
  }
  if (url.startsWith('http') && !url.includes('wsrv.nl')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=75&output=webp`;
  }
  return url;
};

export default api;
