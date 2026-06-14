import { api } from '../lib/api';
import { endpoints } from '../lib/endpoints';

export const JudgeService = {
  getJudges: (params?: any) => api.get(endpoints.judges.list, params),
  createJudge: (data: any) => api.post(endpoints.judges.create, data)
};
