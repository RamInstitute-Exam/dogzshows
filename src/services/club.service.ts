import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const ClubService = {
  getClubs: (params?: any) => api.get(endpoints.clubs.list, params),
  createClub: (data: any) => api.post(endpoints.clubs.create, data)
};
