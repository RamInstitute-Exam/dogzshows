import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface ClubsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isFeatured?: boolean;
}

export function useClubs(params: ClubsQueryParams = {}) {
  return useQuery({
    queryKey: ['clubs', params],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/public/clubs', params);
      return response;
    },
    staleTime: 60 * 1000 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
