import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const FciService = {
  getGroups: () => api.get(endpoints.fci.groups),
  getBreeds: () => api.get(endpoints.fci.breeds)
};
