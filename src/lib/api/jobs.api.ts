// lib/api/jobs.api.ts
import { JobType } from "@/types";
import { api } from "./client";
import type { PaginatedResponse } from "@/lib/types";

export const jobsApi = {
  // Get all jobs with advanced filtering
  getJobs: (params?: any) =>
    api.get<PaginatedResponse<JobType>>("/jobs", { params }),

  // Get job by ID
  getJob: (id: string) => api.get<JobType>(`/jobs/${id}`),

  // Create job
  createJob: (data: any) => api.post<JobType>("/jobs", data),

  // Update job
  updateJob: (id: string, data: any) => api.patch<JobType>(`/jobs/${id}`, data),

  // Delete job
  deleteJob: (id: string) => api.delete<void>(`/jobs/${id}`),

  // Bulk operations (FAANG standard)
  bulkUpdateJobs: (ids: string[], data: any) =>
    api.post<JobType[]>("/jobs/bulk/update", { ids, data }),

  bulkDeleteJobs: (ids: string[]) =>
    api.post<void>("/jobs/bulk/delete", { ids }),

  bulkChangeStatus: (ids: string[], status: any) =>
    api.post<JobType[]>("/jobs/bulk/status", { ids, status }),

  // Duplicate job
  duplicateJob: (id: string) => api.post<JobType>(`/jobs/${id}/duplicate`),

  // Get job stats (for dashboard/analytics)
  getJobStats: () => api.get<any>("/jobs/stats"),

  // Search with autocomplete
  searchJobs: (query: string, limit: number = 10) =>
    api.get<JobType[]>("/jobs/search", { params: { q: query, limit } }),

  // Get similar jobs (recommendation engine)
  getSimilarJobs: (id: string, limit: number = 5) =>
    api.get<JobType[]>(`/jobs/${id}/similar`, { params: { limit } }),

  // Export jobs (CSV, PDF)
  exportJobs: (filters: any, format: "csv" | "pdf" | "xlsx") =>
    api.post<Blob>(
      "/jobs/export",
      { filters, format },
      {
        headers: { Accept: "application/octet-stream" },
      }
    ),

  // Get unique values for filters (faceted search)
  getFilterOptions: () =>
    api.get<{
      companies: string[];
      locations: string[];
      departments: string[];
      tags: string[];
    }>("/jobs/filters"),
};
