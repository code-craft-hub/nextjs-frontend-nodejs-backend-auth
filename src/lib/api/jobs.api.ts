// lib/api/jobs.api.ts
import { api } from './client';
import type { Job, JobFilters, CreateJobData, UpdateJobData, PaginatedResponse, JobStats } from '@/lib/types';

export const jobsApi = {
  // Get all jobs with advanced filtering
  getJobs: (params?: JobFilters) =>
    api.get<PaginatedResponse<Job>>('/jobs', { params }),

  // Get job by ID
  getJob: (id: string) =>
    api.get<Job>(`/jobs/${id}`),

  // Create job
  createJob: (data: CreateJobData) =>
    api.post<Job>('/jobs', data),

  // Update job
  updateJob: (id: string, data: UpdateJobData) =>
    api.patch<Job>(`/jobs/${id}`, data),

  // Delete job
  deleteJob: (id: string) =>
    api.delete<void>(`/jobs/${id}`),

  // Bulk operations (FAANG standard)
  bulkUpdateJobs: (ids: string[], data: UpdateJobData) =>
    api.post<Job[]>('/jobs/bulk/update', { ids, data }),

  bulkDeleteJobs: (ids: string[]) =>
    api.post<void>('/jobs/bulk/delete', { ids }),

  bulkChangeStatus: (ids: string[], status: Job['status']) =>
    api.post<Job[]>('/jobs/bulk/status', { ids, status }),

  // Duplicate job
  duplicateJob: (id: string) =>
    api.post<Job>(`/jobs/${id}/duplicate`),

  // Get job stats (for dashboard/analytics)
  getJobStats: () =>
    api.get<JobStats>('/jobs/stats'),

  // Search with autocomplete
  searchJobs: (query: string, limit: number = 10) =>
    api.get<Job[]>('/jobs/search', { params: { q: query, limit } }),

  // Get similar jobs (recommendation engine)
  getSimilarJobs: (id: string, limit: number = 5) =>
    api.get<Job[]>(`/jobs/${id}/similar`, { params: { limit } }),

  // Export jobs (CSV, PDF)
  exportJobs: (filters: JobFilters, format: 'csv' | 'pdf' | 'xlsx') =>
    api.post<Blob>('/jobs/export', { filters, format }, {
      headers: { 'Accept': 'application/octet-stream' }
    }),

  // Get unique values for filters (faceted search)
  getFilterOptions: () =>
    api.get<{
      companies: string[];
      locations: string[];
      departments: string[];
      tags: string[];
    }>('/jobs/filters'),
};