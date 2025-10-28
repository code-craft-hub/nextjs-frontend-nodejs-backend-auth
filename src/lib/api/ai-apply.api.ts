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
  getAIApplys: (params?: AIApplyFilters) =>
    api.get<PaginatedResponse<any>>(
      "/ai-apply/paginated?" +
        new URLSearchParams(params as Record<string, string>).toString()
    ),

  // Get ai apply by ID
  getAIApply: (id: string) => api.get<any>(`/ai-apply/${id}`),

  // Create ai apply
  createAIApply: (data: CreateAIApplyData) =>
    api.post<any>("/ai-apply", data),

  // Update ai apply
  updateAIApply: (id: string, data: UpdateAIApplyData) =>
    api.patch<any>(`/ai-apply/${id}`, data),

  // Delete ai apply
  deleteAIApply: (id: string) => api.delete<void>(`/ai-apply/${id}`),

  // Duplicate ai apply
  duplicateAIApply: (id: string) =>
    api.post<any>(`/ai-apply/${id}/duplicate`),
};
