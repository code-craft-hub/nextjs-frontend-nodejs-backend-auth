
import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/types";
import type { JobPost } from "@/types";

export const jobPostsApi = {
  list: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobPost>>("/job-posts", { params, token }),

  search: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobPost>>("/job-posts/search", { params, token }),

  query: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobPost>>("/job-posts/search", { params, token }),

  fullTextSearch: (q: string, page = 1, limit = 20, token?: string) =>
    api.get<PaginatedResponse<JobPost>>("/job-posts/fts", {
      params: { q, page, limit },
      token,
    }),

  getActiveJobs: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobPost>>("/job-posts/active", { params, token }),

  getUnprocessed: (limit = 100, token?: string) =>
    api.get<JobPost[]>("/job-posts/unprocessed", { params: { limit }, token }),

  getStats: (token?: string) => api.get<any>("/job-posts/stats", { token }),

  getByCompany: (companyName: string, params?: any, token?: string) =>
    api.get<PaginatedResponse<JobPost>>(
      `/job-posts/company/${encodeURIComponent(companyName)}`,
      { params, token },
    ),

  getByLocation: (location: string, params?: any, token?: string) =>
    api.get<PaginatedResponse<JobPost>>(
      `/job-posts/location/${encodeURIComponent(location)}`,
      { params, token },
    ),

  getById: (id: string, token?: string) =>
    api.get<JobPost>(`/job-posts/${id}`, { token }),

  create: (data: any, token?: string) =>
    api.post<JobPost>("/job-posts", data, { token }),

  createMany: (items: any[], token?: string) =>
    api.post<JobPost[]>("/job-posts/bulk", { jobPosts: items }, { token }),

  update: (id: string, data: any, token?: string) =>
    api.patch<JobPost>(`/job-posts/${id}`, data, { token }),

  markAsProcessed: (id: string, token?: string) =>
    api.patch<JobPost>(`/job-posts/${id}/processed`, {}, { token }),

  delete: (id: string, token?: string) =>
    api.delete<void>(`/job-posts/${id}`, { token }),
};

export default jobPostsApi;