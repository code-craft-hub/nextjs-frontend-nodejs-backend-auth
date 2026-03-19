// lib/api/cover-letters.api.ts
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
  coverLetter?: string;
  firstName?: string;
  lastName?: string;
  salutation?: string;
  phoneNumber?: string;
  recruiterEmail?: string;
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
  getCoverLetters: (params?: CoverLetterFilters, token?: string) =>
    api.get<PaginatedResponse<CoverLetter>>(
      `/cover-letters?` +
        new URLSearchParams(params as Record<string, string>).toString(),
      { token }
    ),

  // Get cover letter by ID
  getCoverLetter: async (id: string, token?: string) => {
    const { data } = await api.get<{ data: CoverLetter }>(
      `/cover-letters/${id}`,
      { token }
    );
    return data;
  },

  // Create cover letter
  createCoverLetter: (data: CreateCoverLetterData, token?: string) =>
    api.post<CoverLetter>(`/cover-letters`, data, { token }),


  generateCoverLetter: (data: CreateCoverLetterData, token?: string) =>
    api.post<CoverLetter>(`/cover-letters/stream`, data, { token }),

  // Update cover letter
  updateCoverLetter: (id: string, data: UpdateCoverLetterData, token?: string) =>
    api.patch<CoverLetter>(`/cover-letters/${id}`, data, { token }),

  // Delete cover letter
  deleteCoverLetter: (id: string, token?: string) => api.delete<void>(`/cover-letters/${id}`, { token }),

  // Hard delete cover letter
  hardDeleteCoverLetter: (id: string, token?: string) => api.delete<void>(`/cover-letters/${id}/hard-delete`, { token }),

  // Duplicate cover letter
  duplicateCoverLetter: (id: string, token?: string) =>
    api.post<CoverLetter>(`/cover-letters/${id}/duplicate`, undefined, { token }),
};
