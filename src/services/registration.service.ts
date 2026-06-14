import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const RegistrationService = {
  validate: (data: any) => api.post(endpoints.registrations.validate, data),
  getRegistrations: (params?: any) => api.get(endpoints.registrations.list, params),
  getUserRegistrations: () => api.get(endpoints.registrations.userRegistrations),
  createRegistration: (data: any) => api.post(endpoints.registrations.create, data),
  updateStatus: (id: string, data: any) => api.patch(endpoints.registrations.updateStatus(id), data),
  bulkDelete: (data: any) => api.post(endpoints.registrations.bulkDelete, data)
};
