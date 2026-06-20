import os

services_dir = r"d:\bala backend\frontend\src\services"
os.makedirs(services_dir, exist_ok=True)

services = {
    "auth.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const AuthService = {
  login: (data: any) => api.post(endpoints.auth.login, data),
  register: (data: any) => api.post(endpoints.auth.register, data),
  getProfile: () => api.get(endpoints.auth.profile)
};
""",
    "dog.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const DogService = {
  getDogs: (params?: any) => api.get(endpoints.dogs.list, params),
  getDog: (id: string) => api.get(endpoints.dogs.get(id)),
  createDog: (data: any) => api.post(endpoints.dogs.create, data),
  updateDog: (id: string, data: any) => api.put(endpoints.dogs.update(id), data),
  deleteDog: (id: string) => api.delete(endpoints.dogs.delete(id)),
  bulkDeleteDogs: (data: any) => api.post(endpoints.dogs.bulkDelete, data)
};
""",
    "event.service.ts": """import { api } from '../lib/api';
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
""",
    "competition.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const CompetitionService = {
  getMatches: (params?: any) => api.get(endpoints.competitions.matches, params),
  scoreMatch: (data: any) => api.patch(endpoints.competitions.score, data)
};
""",
    "dashboard.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const DashboardService = {
  getStats: () => api.get(endpoints.dashboard.stats),
  getAdminStats: () => api.get(endpoints.dashboard.adminStats)
};
""",
    "user.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const UserService = {
  getUsers: (params?: any) => api.get(endpoints.users.list, params),
  getRoles: () => api.get(endpoints.users.roles)
};
""",
    "club.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const ClubService = {
  getClubs: (params?: any) => api.get(endpoints.clubs.list, params),
  createClub: (data: any) => api.post(endpoints.clubs.create, data)
};
""",
    "judge.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const JudgeService = {
  getJudges: (params?: any) => api.get(endpoints.judges.list, params),
  createJudge: (data: any) => api.post(endpoints.judges.create, data)
};
""",
    "fci.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const FciService = {
  getGroups: () => api.get(endpoints.fci.groups),
  getBreeds: () => api.get(endpoints.fci.breeds)
};
""",
    "registration.service.ts": """import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const RegistrationService = {
  validate: (data: any) => api.post(endpoints.registrations.validate, data),
  getRegistrations: (params?: any) => api.get(endpoints.registrations.list, params),
  getUserRegistrations: () => api.get(endpoints.registrations.userRegistrations),
  createRegistration: (data: any) => api.post(endpoints.registrations.create, data),
  updateStatus: (id: string, data: any) => api.patch(endpoints.registrations.updateStatus(id), data),
  bulkDelete: (data: any) => api.post(endpoints.registrations.bulkDelete, data)
};
"""
}

for name, content in services.items():
    with open(os.path.join(services_dir, name), "w") as f:
        f.write(content)

print("Generated services")
