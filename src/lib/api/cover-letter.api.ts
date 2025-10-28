// lib/api/cover-letter.api.ts
import { CoverLetter } from "@/types";
import { api } from "./client";
import type {
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
    api.get<PaginatedResponse<CoverLetter>>(
      "/cover-letter/paginated?" +
        new URLSearchParams(params as Record<string, string>).toString()
    ),

  // Get cover letter by ID
  getCoverLetter: async (id: string) => {
    const { data } = await api.get<{ data: CoverLetter }>(
      `/cover-letter/${id}`
    );
    return data;
  },

  // Create cover letter
  createCoverLetter: (data: CreateCoverLetterData) =>
    api.post<CoverLetter>("/cover-letter", data),

  // Update cover letter
  updateCoverLetter: (id: string, data: UpdateCoverLetterData) =>
    api.patch<CoverLetter>(`/cover-letter/${id}`, data),

  // Delete cover letter
  deleteCoverLetter: (id: string) => api.delete<void>(`/cover-letter/${id}`),

  // Duplicate cover letter
  duplicateCoverLetter: (id: string) =>
    api.post<CoverLetter>(`/cover-letter/${id}/duplicate`),
};
