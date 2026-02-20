import { api, BACKEND_API_VERSION } from "./client";

// ─── Types ────────────────────────────────────────────────────────

export interface AutoApplyRecord {
  id: string;
  userId: string;
  resumeId?: string | null;
  jobId?: string | null;
  coverLetterId?: string | null;
  title: string;
  type: string;
  action: string;
  fileType?: string | null;
  email?: string | null;
  recruiterEmail?: string | null;
  jobDescription?: string | null;
  status?: string | null;
  sentAt?: string | null;
  errorReason?: string | null;
  source?: string | null;
  gcsPath?: string | null;
  pdfSignedUrl?: string | null;
  modifiedBy?: string | null;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface CreateAutoApplyData {
  id: string;
  resumeId?: string | null;
  jobId?: string | null;
  coverLetterId?: string | null;
  title: string;
  type?: string;
  fileType?: string | null;
  email?: string | null;
  recruiterEmail?: string | null;
  jobDescription?: string | null;
  status?: string;
  source?: string;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateAutoApplyData {
  resumeId?: string | null;
  jobId?: string | null;
  coverLetterId?: string | null;
  title?: string;
  type?: string;
  fileType?: string | null;
  email?: string | null;
  recruiterEmail?: string | null;
  jobDescription?: string | null;
  status?: string;
  errorReason?: string | null;
  gcsPath?: string | null;
  pdfSignedUrl?: string | null;
  sentAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── API Client ───────────────────────────────────────────────────

const AUTO_APPLY_BASE = `${BACKEND_API_VERSION}/auto-applies`;

export const autoApplyApi = {
  create: (data: CreateAutoApplyData, token?: string) =>
    api.post<ApiResponse<AutoApplyRecord>>(AUTO_APPLY_BASE, data, { token }),

  getAll: (token?: string) =>
    api.get<ApiResponse<AutoApplyRecord[]>>(AUTO_APPLY_BASE, { token }),

  getById: (id: string, token?: string) =>
    api.get<ApiResponse<AutoApplyRecord>>(`${AUTO_APPLY_BASE}/${id}`, {
      token,
    }),

  getRecent: (limit?: number, token?: string) =>
    api.get<ApiResponse<AutoApplyRecord[]>>(
      `${AUTO_APPLY_BASE}/recent${limit ? `?limit=${limit}` : ""}`,
      { token },
    ),

  getCount: (token?: string) =>
    api.get<ApiResponse<{ count: number }>>(`${AUTO_APPLY_BASE}/count`, {
      token,
    }),

  getByType: (type: string, token?: string) =>
    api.get<ApiResponse<AutoApplyRecord[]>>(`${AUTO_APPLY_BASE}/type/${type}`, {
      token,
    }),

  getByResumeId: (resumeId: string, token?: string) =>
    api.get<ApiResponse<AutoApplyRecord[]>>(
      `${AUTO_APPLY_BASE}/resume/${resumeId}`,
      { token },
    ),

  getByCoverLetterId: (coverLetterId: string, token?: string) =>
    api.get<ApiResponse<AutoApplyRecord[]>>(
      `${AUTO_APPLY_BASE}/cover-letter/${coverLetterId}`,
      { token },
    ),

  update: (id: string, data: UpdateAutoApplyData, token?: string) =>
    api.patch<ApiResponse<AutoApplyRecord>>(`${AUTO_APPLY_BASE}/${id}`, data, {
      token,
    }),

  delete: (id: string, token?: string) =>
    api.delete<ApiResponse<{ id: string; message: string }>>(
      `${AUTO_APPLY_BASE}/${id}`,
      { token },
    ),

  bulkDelete: (ids: string[], token?: string) =>
    api.delete<ApiResponse<{ deletedCount: number; message: string }>>(
      `${AUTO_APPLY_BASE}/bulk-delete`,
      { token, body: JSON.stringify({ ids }) },
    ),
};
