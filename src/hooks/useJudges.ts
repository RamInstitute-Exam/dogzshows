import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface JudgesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  experience?: string;
  category?: string;
  status?: string;
}

export function useJudges(params: JudgesQueryParams = {}) {
  return useQuery({
    queryKey: ['judges', params],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/public/judges', params);
      return response;
    },
    staleTime: 0, // Always fetch fresh data from the server
    refetchOnWindowFocus: true, // Auto-refresh when user returns to the tab
  });
}

export function useJudgeCategories() {
  return {
    categories: [],
    total: 0,
    loading: false,
    fetchCategories: (params?: any) => {},
    createCategory: async (data?: any) => false,
    updateCategory: async (id?: string, data?: any) => false,
    deleteCategory: async (id?: string) => false
  };
}

export function useJudgeRequests() {
  return {
    requests: [],
    total: 0,
    loading: false,
    fetchRequests: (params?: any) => {},
    approveRequest: async (id?: string) => false,
    rejectRequest: async (id?: string) => false,
    updateRequest: async (id?: string, data?: any) => false,
    deleteRequest: async (id?: string) => false
  };
}
