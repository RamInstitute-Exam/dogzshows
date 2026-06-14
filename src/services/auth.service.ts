import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const AuthService = {
  login: (data: any) => api.post(endpoints.auth.login, data),
  register: (data: any) => api.post(endpoints.auth.register, data),
  getProfile: () => api.get(endpoints.auth.profile)
};
