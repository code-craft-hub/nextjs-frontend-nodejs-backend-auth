// lib/api/cover-letter.api.ts
import { api } from "./client";
import type {
  CoverLetter,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

export interface CreateCoverLetterData {
  title: string;
  content: string;
  jobTitle?: string;
  company?: string;
}

export interface UpdateCoverLetterData {
  title?: string;
  content?: string;
  jobTitle?: string;
  company?: string;
}

export interface CoverLetterFilters extends PaginationParams {
  company?: string;
  jobTitle?: string;
  search?: string;
}

export const coverLetterApi = {
  // Get all cover letters
  getCoverLetters: (params?: CoverLetterFilters) =>
    api.get<PaginatedResponse<CoverLetter>>("/cover-letters", { params }),

  // Get cover letter by ID
  getCoverLetter: (id: string) => api.get<CoverLetter>(`/cover-letters/${id}`),

  // Create cover letter
  createCoverLetter: (data: CreateCoverLetterData) =>
    api.post<CoverLetter>("/cover-letters", data),

  // Update cover letter
  updateCoverLetter: (id: string, data: UpdateCoverLetterData) =>
    api.patch<CoverLetter>(`/cover-letters/${id}`, data),

  // Delete cover letter
  deleteCoverLetter: (id: string) => api.delete<void>(`/cover-letters/${id}`),

  // Duplicate cover letter
  duplicateCoverLetter: (id: string) =>
    api.post<CoverLetter>(`/cover-letters/${id}/duplicate`),
};
