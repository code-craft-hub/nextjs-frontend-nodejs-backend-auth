// lib/api/cover-letter.api.ts
import { api } from "./client";
import type {
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

export interface CreateAIApplyData {
  title: string;
  content: string;
  jobTitle?: string;
  company?: string;
}

export interface UpdateAIApplyData {
  title?: string;
  content?: string;
  jobTitle?: string;
  company?: string;
}

export interface AIApplyFilters extends PaginationParams {
  company?: string;
  jobTitle?: string;
  search?: string;
}

export const AIApplyApi = {
  // Get all ai applys
  getAIApplys: (params?: AIApplyFilters, token?: string) =>
    api.get<PaginatedResponse<any>>(
      "/ai-apply/paginated?" +
        new URLSearchParams(params as Record<string, string>).toString(),
      { token }
    ),

  // Get ai apply by ID
  getAIApply: (id: string, token?: string) => api.get<any>(`/ai-apply/${id}`, { token }),
  // Create ai apply
  createAIApply: (data: CreateAIApplyData, token?: string) =>
    api.post<any>("/ai-apply", data, { token }),

  // Update ai apply
  updateAIApply: (id: string, data: UpdateAIApplyData, token?: string) =>
    api.patch<any>(`/ai-apply/${id}`, data, { token }),
  // Delete ai apply
  deleteAIApply: (id: string, token?: string) => api.delete<void>(`/ai-apply/${id}`, { token }),

  // Duplicate ai apply
  duplicateAIApply: (id: string, token?: string) =>
    api.post<any>(`/ai-apply/${id}/duplicate`, undefined, { token }),
};
