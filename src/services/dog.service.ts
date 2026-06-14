import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const DogService = {
  getDogs: (params?: any) => api.get(endpoints.dogs.list, params),
  getDog: (id: string) => api.get(endpoints.dogs.get(id)),
  createDog: (data: any) => api.post(endpoints.dogs.create, data),
  updateDog: (id: string, data: any) => api.put(endpoints.dogs.update(id), data),
  deleteDog: (id: string) => api.delete(endpoints.dogs.delete(id)),
  bulkDeleteDogs: (data: any) => api.post(endpoints.dogs.bulkDelete, data)
};
