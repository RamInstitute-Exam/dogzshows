import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

// ── Public Hooks ───────────────────────────────────────────────────────────

export function useMediaPhotos(params?: any) {
  return useQuery({
    queryKey: ['media', 'photos', params],
    queryFn: async () => api.get('/public/media/photos', params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useMediaVideos(params?: any) {
  return useQuery({
    queryKey: ['media', 'videos', params],
    queryFn: async () => api.get('/public/media/videos', params),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useFeaturedMediaImages() {
  return useQuery({
    queryKey: ['media', 'featured-photos'],
    queryFn: async () => api.get('/public/media/photos/featured'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useFeaturedMediaVideos() {
  return useQuery({
    queryKey: ['media', 'featured-videos'],
    queryFn: async () => api.get('/public/media/videos/featured'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function usePhotoBySlug(slug: string) {
  return useQuery({
    queryKey: ['media', 'photo', slug],
    queryFn: async () => api.get(`/public/media/photos/${slug}`),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

export function useVideoBySlug(slug: string) {
  return useQuery({
    queryKey: ['media', 'video', slug],
    queryFn: async () => api.get(`/public/media/videos/${slug}`),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

// Legacy alias so existing code using useMediaImages doesn't break
export const useMediaImages = useMediaPhotos;

// ── Admin CRUD Hooks ─────────────────────────────────────────────────────────

export const mediaKeys = {
  all: ['admin', 'media'] as const,
  photos: (params?: any) => ['admin', 'media', 'photos', params ?? 'all'] as const,
  videos: (params?: any) => ['admin', 'media', 'videos', params ?? 'all'] as const,
};

export function useAdminMediaPhotos(params?: any) {
  return useQuery({
    queryKey: mediaKeys.photos(params),
    queryFn: async () => api.get('/media/photos', params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useAdminMediaVideos(params?: any) {
  return useQuery({
    queryKey: mediaKeys.videos(params),
    queryFn: async () => api.get('/media/videos', params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// ── Legacy Aliases & New Active Hooks (backward compatibility) ──────────────────────────────────
// These hooks are connected to backend endpoints for categories and albums

/** @deprecated Use useMediaPhotos instead */
export const useAdminMediaImages = useAdminMediaPhotos;

export function useMediaAlbums(params?: any) {
  return useQuery({
    queryKey: ['media', 'albums', params],
    queryFn: async () => api.get('/public/photo-albums', params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMediaCategories(params?: any) {
  return useQuery({
    queryKey: ['media', 'categories', params],
    queryFn: async () => api.get('/public/photo-categories', params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useVideoCategories(params?: any) {
  return useQuery({
    queryKey: ['media', 'video-categories', params],
    queryFn: async () => api.get('/public/video-categories', params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAdminMediaCategories(params?: any) {
  return useQuery({
    queryKey: ['admin', 'media', 'categories', params],
    queryFn: async () => api.get('/photo-categories', params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useAdminMediaAlbums(params?: any) {
  return useQuery({
    queryKey: ['admin', 'media', 'albums', params],
    queryFn: async () => api.get('/photo-albums', params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useAdminVideoCategories(params?: any) {
  return useQuery({
    queryKey: ['admin', 'media', 'video-categories', params],
    queryFn: async () => api.get('/video-categories', params),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

