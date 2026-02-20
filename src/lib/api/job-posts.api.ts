// lib/api/job-posts.api.ts
import { api } from "./client";
import type { PaginatedResponse } from "@/lib/types";
import type { JobPost } from "@/types";

export const jobPostsApi = {
  list: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobPost>>("/job-posts", { params, token }),

  search: (params?: any, token?: string) =>
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
// lib/api/jobs.api.ts
import { JobType } from "@/types";
import { api } from "./client";
import type { PaginatedResponse } from "@/lib/types";
import type { RecommendationsResponse } from "@/app/dashboard/(dashboard)/components/recent-activity/types";

export const jobsApi = {
  // Get all jobs with advanced filtering
  getJobs: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobType>>("/job-recommendations/search/ilike", {
      params,
      token,
    }),
  // Get all jobs with advanced filtering
  autoApply: () => {
    return api.get<{ data: RecommendationsResponse }>(`/recommendations`);
  },
  autoApplyGet: (params?: any, token?: string) => {
    return api.get<PaginatedResponse<JobType>>(
      "/job-recommendations/search/jobs",
      {
        params,
        token,
      },
    );
  },

  // Get job by ID
  getJob: async (id: string, token?: string) => {
    try {
      const data = await api.get<{ data: JobType }>(
        `/job-recommendations/${id}`,
        { token },
      );
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Create job
  createJob: (data: any) => api.post<JobType>("/job-recommendations", data),

  // Update job
  updateJob: (id: string, data: any) => api.patch<JobType>(`/jobs/${id}`, data),

  // Update application history of a job
  updateJobApplicationHistory: (id: string, data: any) =>
    api.patch<JobType>(`/jobs/application-history/${id}`, data),

  // Delete job
  deleteJob: (id: string) => api.delete<void>(`/job-recommendations/${id}`),

  // Bulk operations (FAANG standard)
  bulkUpdateJobs: (ids: string[], data: any) =>
    api.post<JobType[]>("/job-recommendations/bulk/update", { ids, data }),

  bulkDeleteJobs: (ids: string[]) =>
    api.post<void>("/job-recommendations/bulk/delete", { ids }),

  bulkChangeStatus: (ids: string[], status: any) =>
    api.post<JobType[]>("/job-recommendations/bulk/status", { ids, status }),

  // Duplicate job
  duplicateJob: (id: string) =>
    api.post<JobType>(`/job-recommendations/${id}/duplicate`),

  // Get job stats (for dashboard/analytics)
  getJobStats: () => api.get<any>("/job-recommendations/stats"),

  // Search with autocomplete
  searchJobs: (query: string, limit: number = 10) =>
    api.get<JobType[]>("/job-recommendations/search", {
      params: { q: query, limit },
    }),

  // Get similar jobs (recommendation engine)
  getSimilarJobs: (id: string, limit: number = 5) =>
    api.get<JobType[]>(`/job-recommendations/${id}/similar`, {
      params: { limit },
    }),

  // Export jobs (CSV, PDF)
  exportJobs: (filters: any, format: "csv" | "pdf" | "xlsx") =>
    api.post<Blob>(
      "/job-recommendations/export",
      { filters, format },
      {
        headers: { Accept: "application/octet-stream" },
      },
    ),

  // Get unique values for filters (faceted search)
  getFilterOptions: () =>
    api.get<{
      companies: string[];
      locations: string[];
      departments: string[];
      tags: string[];
    }>("/job-recommendations/filters"),
  // Fetch bookmarked jobs by IDs with pagination (client passes user's bookmarked IDs)
  // Body: { jobIds: string[], page?: number, limit?: number, title?: string }
  getBookmarkedJobs: (
    jobIds: string[],
    page = 1,
    limit = 20,
    title?: string,
    token?: string,
  ) =>
    api.post<PaginatedResponse<JobType>>(
      "/job-recommendations/bookmarked",
      {
        jobIds,
        page,
        limit,
        title,
      },
      { token },
    ),
  // Fetch applied jobs by IDs with pagination (client passes user's applied job IDs)
  // Body: { jobIds: string[], page?: number, limit?: number, title?: string }
  getAppliedJobs: (
    jobIds: string[],
    page = 1,
    limit = 20,
    title?: string,
    token?: string,
  ) =>
    api.post<PaginatedResponse<JobType>>(
      "/job-recommendations/applied-jobs",
      {
        jobIds,
        page,
        limit,
        title,
      },
      { token },
    ),
};
