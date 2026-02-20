// lib/api/job-applications.api.ts
import { api } from "./client";
import type { PaginatedResponse } from "@/lib/types";
import type { JobApplication } from "@/types";

export const jobApplicationsApi = {
  create: (data: any, token?: string) =>
    api.post<JobApplication>("/job-applications", data, { token }),

  // Returns authenticated user's applications (server reads user from token)
  list: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobApplication>>("/job-applications", {
      params,
      token,
    }),

  check: (jobId: string, token?: string) =>
    api.get<{ applied: boolean }>("/job-applications/check", {
      params: { jobId },
      token,
    }),

  getById: (id: string, token?: string) =>
    api.get<JobApplication>(`/job-applications/${id}`, { token }),

  getByStatus: (status: string, params?: any, token?: string) =>
    api.get<PaginatedResponse<JobApplication>>(
      `/job-applications/status/${encodeURIComponent(status)}`,
      { params, token },
    ),

  getByJob: (jobId: string, token?: string) =>
    api.get<JobApplication[]>(
      `/job-applications/job/${encodeURIComponent(jobId)}`,
      { token },
    ),

  updateStatus: (id: string, status: string, token?: string) =>
    api.patch<JobApplication>(
      `/job-applications/${id}/status`,
      { status },
      { token },
    ),

  update: (id: string, data: any, token?: string) =>
    api.patch<JobApplication>(`/job-applications/${id}`, data, { token }),

  delete: (id: string, token?: string) =>
    api.delete<void>(`/job-applications/${id}`, { token }),

  adminList: (params?: any, token?: string) =>
    api.get<PaginatedResponse<JobApplication>>(`/job-applications/admin/list`, {
      params,
      token,
    }),
};

export default jobApplicationsApi;
