import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const DashboardService = {
  getStats: () => api.get(endpoints.dashboard.stats),
  getAdminStats: () => api.get(endpoints.dashboard.adminStats)
};
