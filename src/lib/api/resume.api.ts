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
  getResumes: (params?: ResumeFilters) =>
    api.get<PaginatedResponse<Resume>>(
      "/resume/paginated?" +
        new URLSearchParams(params as Record<string, string>).toString()
    ),

  // Get resume by ID
  getResume: async (id: string) => {
    const { data } = await api.get<{ data: Resume }>(`/resume/${id}`);
    return data;
  },

  // Create resume
  createResume: (data: CreateResumeData) => api.post<Resume>("/resume", data),

  // Update resume
  updateResume: (id: string, data: UpdateResumeData) =>
    api.patch<Resume>(`/resume/${id}`, data),

  // Delete resume
  deleteResume: (id: string) => api.delete<void>(`/resume/${id}`),

  // Duplicate resume
  duplicateResume: (id: string) => api.post<Resume>(`/resume/${id}/duplicate`),

  // Export resume
  exportResume: (id: string, format: "pdf" | "docx") =>
    api.post<Blob>(`/resume/${id}/export`, { format }),
};
