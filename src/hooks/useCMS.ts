import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useGlobalCMS() {
  return useQuery({
    queryKey: ['cms', 'global'],
    queryFn: async () => {
      return api.get('/public/cms/global');
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useHomeCMS() {
  return useQuery({
    queryKey: ['cms', 'home'],
    queryFn: async () => {
      return api.get('/public/stats');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useEventsCMS() {
  return useQuery({
    queryKey: ['cms', 'events'],
    queryFn: async () => {
      return api.get('/public/events/upcoming');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useHomepageBanners() {
  return useQuery({
    queryKey: ['homepage-banners'],
    queryFn: async () => {
      return api.get('/banners');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useFCIGroups() {
  return useQuery({
    queryKey: ['fci-groups'],
    queryFn: async () => {
      return api.get('/public/groups');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function usePageBanner(slug: string) {
  return useQuery({
    queryKey: ['page-banner', slug],
    queryFn: async () => {
      // Encode slug so nested paths like /winners/categories are passed as a single param
      return api.get(`/public/page-banners/${encodeURIComponent(slug)}`);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!slug,
  });
}

export function useAboutCMS() {
  return useQuery({
    queryKey: ['cms', 'about'],
    queryFn: async () => {
      return api.get('/public/cms/about');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useFCIGroup(slug: string) {
  return useQuery({
    queryKey: ['fci-group', slug],
    queryFn: async () => {
      return api.get(`/public/group-details?slug=${slug}`);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    enabled: !!slug,
  });
}

export function useSponsors() {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      return api.get('/public/sponsors');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useWinners() {
  return useQuery({
    queryKey: ['winners'],
    queryFn: async () => {
      return api.get('/public/winners');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useJudges() {
  return useQuery({
    queryKey: ['judges'],
    queryFn: async () => {
      return api.get('/public/judges');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      return api.get('/public/clubs');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      return api.get('/public/gallery/public');
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

