import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const CompetitionService = {
  getMatches: (params?: any) => api.get(endpoints.competitions.matches, params),
  scoreMatch: (data: any) => api.patch(endpoints.competitions.score, data)
};
