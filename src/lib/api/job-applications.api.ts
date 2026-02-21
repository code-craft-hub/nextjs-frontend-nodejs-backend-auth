import { api } from "./client";
import type { JobApplication } from "@/types";

// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface CreateApplicationData {
  jobId: string;
  status?: string;
  resumeId?: string;
  coverLetterId?: string;
  notes?: string;
  recruiterEmail?: string;
}

export interface UpdateApplicationData {
  status?: string;
  notes?: string;
  followUpDate?: string;
  resumeId?: string;
  coverLetterId?: string;
}

// ─── Response Envelopes ───────────────────────────────────────────────────────

export interface ApplicationResponse {
  success: boolean;
  message: string;
  data: JobApplication;
}

export interface ApplicationDetailResponse {
  success: boolean;
  data: JobApplication;
}

/**
 * Matches the actual backend controller shape:
 *   { success, data: JobApplication[], pagination: { page, limit, count } }
 *
 * NOTE: `count` is the item count for the current page only, not the total.
 *       Use `count < limit` to determine whether a next page exists.
 */
export interface ApplicationListResponse {
  success: boolean;
  data: JobApplication[];
  pagination: {
    page: number;
    limit: number;
    count: number;
  };
}

export interface ApplicationCheckResponse {
  success: boolean;
  data: {
    applied: boolean;
  };
}

export interface ApplicationDeleteResponse {
  success: boolean;
  message: string;
}

export interface ApplicationsByJobResponse {
  success: boolean;
  data: JobApplication[];
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const jobApplicationsApi = {
  /**
   * POST /job-applications
   * Submit a new job application for the authenticated user.
   */
  create: (data: CreateApplicationData, token?: string) =>
    api.post<ApplicationResponse>("/job-applications", data, { token }),

  /**
   * GET /job-applications
   * Retrieve the authenticated user's applications with pagination.
   */
  list: (page = 1, limit = 20, token?: string) =>
    api.get<ApplicationListResponse>("/job-applications", {
      params: { page, limit },
      token,
    }),

  /**
   * GET /job-applications/:applicationId
   * Retrieve a single application by its ID.
   */
  getById: (applicationId: string, token?: string) =>
    api.get<ApplicationDetailResponse>(
      `/job-applications/${applicationId}`,
      { token },
    ),

  /**
   * GET /job-applications/check?jobId=
   * Check whether the authenticated user has applied for a specific job.
   */
  check: (jobId: string, token?: string) =>
    api.get<ApplicationCheckResponse>("/job-applications/check", {
      params: { jobId },
      token,
    }),

  /**
   * GET /job-applications/status/:status
   * Retrieve applications filtered by status with pagination.
   */
  getByStatus: (
    status: string,
    page = 1,
    limit = 20,
    token?: string,
  ) =>
    api.get<ApplicationListResponse>(
      `/job-applications/status/${encodeURIComponent(status)}`,
      { params: { page, limit }, token },
    ),

  /**
   * GET /job-applications/job/:jobId
   * Retrieve all applications for a specific job posting.
   */
  getByJob: (jobId: string, token?: string) =>
    api.get<ApplicationsByJobResponse>(
      `/job-applications/job/${encodeURIComponent(jobId)}`,
      { token },
    ),

  /**
   * PATCH /job-applications/:applicationId/status
   * Update only the status field (ownership enforced server-side).
   */
  updateStatus: (applicationId: string, status: string, token?: string) =>
    api.patch<ApplicationResponse>(
      `/job-applications/${applicationId}/status`,
      { status },
      { token },
    ),

  /**
   * PATCH /job-applications/:applicationId
   * Update application details (ownership enforced server-side).
   */
  update: (
    applicationId: string,
    data: UpdateApplicationData,
    token?: string,
  ) =>
    api.patch<ApplicationResponse>(
      `/job-applications/${applicationId}`,
      data,
      { token },
    ),

  /**
   * DELETE /job-applications/:applicationId
   * Soft-delete an application (ownership enforced server-side).
   */
  delete: (applicationId: string, token?: string) =>
    api.delete<ApplicationDeleteResponse>(
      `/job-applications/${applicationId}`,
      { token },
    ),

  /**
   * GET /job-applications/admin/list
   * List all applications — admin view with pagination.
   */
  adminList: (page = 1, limit = 20, token?: string) =>
    api.get<ApplicationListResponse>("/job-applications/admin/list", {
      params: { page, limit },
      token,
    }),
} as const;

export default jobApplicationsApi;
