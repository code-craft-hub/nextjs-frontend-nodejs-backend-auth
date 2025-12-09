// lib/api/resume.api.ts
import { Resume } from "@/types";
import { api } from "./client";
import type { PaginatedResponse, PaginationParams } from "@/lib/types";

export interface CreateResumeData {
  title: string;
  content: any;
  template?: string;
}

export interface UpdateResumeData {
  title?: string;
  content?: any;
  template?: string;
}

export interface ResumeFilters extends PaginationParams {
  template?: string;
  search?: string;
}

export const resumeApi = {
  // Get all resumes
  getResumes: (params?: ResumeFilters, token?: string) =>
    api.get<PaginatedResponse<Resume>>(
      "/resume/paginated?" +
        new URLSearchParams(params as Record<string, string>).toString(),
      { token }
    ),

  // Get resume by ID
  getResume: async (id: string, token?: string) => {
    const { data } = await api.get<{ data: Resume }>(`/resume/${id}`, { token });
    return data;
  },

  // Create resume
  createResume: (data: CreateResumeData, token?: string) => api.post<Resume>("/resume", data, { token }),

  // Update resume
  updateResume: (id: string, data: UpdateResumeData, token?: string) =>
    api.patch<Resume>(`/resume/${id}`, data, { token }),
  // Delete resume
  deleteResume: (id: string, token?: string) => api.delete<void>(`/resume/${id}`, { token }),

  // Duplicate resume
  duplicateResume: (id: string, token?: string) => api.post<Resume>(`/resume/${id}/duplicate`, undefined, { token }),

  // Export resume
  exportResume: (id: string, format: "pdf" | "docx") =>
    api.post<Blob>(`/resume/${id}/export`, { format }),
};
