// lib/api/resume.api.ts
import { api } from './client';
import type { Resume, PaginatedResponse, PaginationParams } from '@/lib/types';

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
  getResumes: (_params?: ResumeFilters) =>
    api.get<PaginatedResponse<Resume>>('/resumes',),

  // Get resume by ID
  getResume: (id: string) =>
    api.get<Resume>(`/resumes/${id}`),

  // Create resume
  createResume: (data: CreateResumeData) =>
    api.post<Resume>('/resumes', data),

  // Update resume
  updateResume: (id: string, data: UpdateResumeData) =>
    api.patch<Resume>(`/resumes/${id}`, data),

  // Delete resume
  deleteResume: (id: string) =>
    api.delete<void>(`/resumes/${id}`),

  // Duplicate resume
  duplicateResume: (id: string) =>
    api.post<Resume>(`/resumes/${id}/duplicate`),

  // Export resume
  exportResume: (id: string, format: 'pdf' | 'docx') =>
    api.post<Blob>(`/resumes/${id}/export`, { format }),
};