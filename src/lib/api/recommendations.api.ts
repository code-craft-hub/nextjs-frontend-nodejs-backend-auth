import { api } from "./client";
const JOB_RECOMMENDATION_API = `/recommendations`;

export const recommendationsApi = {
  // GET /recommendations - returns saved recommendations or queues generation
  getUserRecommendations: (token?: string) =>
    api.get(`${JOB_RECOMMENDATION_API}`, { token }),

  // POST /recommendations - get recommendations based on request body (optionally save)
  getRecommendations: (payload: any, token?: string) =>
    api.post(`${JOB_RECOMMENDATION_API}`, payload, { token }),

  // GET /recommendations/quick-search
  quickSearch: (params: {
    jobTitle: string;
    skills?: string;
    limit?: number;
  }) => api.get(`${JOB_RECOMMENDATION_API}/quick-search`, { params }),

  // GET /recommendations/similar/:jobId
  getSimilarJobs: (jobId: string, params?: { limit?: number }) =>
    api.get(`${JOB_RECOMMENDATION_API}/similar/${encodeURIComponent(jobId)}`, {
      params,
    }),

  // GET /recommendations/by-title
  getJobsByTitle: (params: { title: string; limit?: number }) =>
    api.get(`${JOB_RECOMMENDATION_API}/by-title`, { params }),

  // GET /recommendations/by-skills
  getJobsBySkills: (params: { skills: string; limit?: number }) =>
    api.get(`${JOB_RECOMMENDATION_API}/by-skills`, { params }),
};

export default recommendationsApi;
