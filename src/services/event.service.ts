import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const EventService = {
  getEvents: (params?: any) => api.get(endpoints.events.list, params),
  getAdminEvents: (params?: any) => api.get(endpoints.events.adminList, params),
  getUpcomingEvents: (params?: any) => api.get(endpoints.events.upcoming, params),
  getPastEvents: (params?: any) => api.get(endpoints.events.past, params),
  getEvent: (id: string) => api.get(endpoints.events.get(id)),
  createEvent: (data: any) => api.post(endpoints.events.create, data),
  updateEvent: (id: string, data: any) => api.put(endpoints.events.update(id), data),
  deleteEvent: (id: string) => api.delete(endpoints.events.delete(id)),
  bulkDeleteEvents: (data: any) => api.post(endpoints.events.bulkDelete, data)
};
