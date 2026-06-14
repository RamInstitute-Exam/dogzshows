import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const UserService = {
  getUsers: (params?: any) => api.get(endpoints.users.list, params),
  getRoles: () => api.get(endpoints.users.roles)
};
