// lib/api/interview.api.ts
import { InterviewQuestion } from "@/types";
import { api } from "./client";
import type {
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";
import { BACKEND_API_VERSION } from "./profile.api";


export interface CreateInterviewQuestionData {
  question: string;
  answer?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface UpdateInterviewQuestionData {
  question?: string;
  answer?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface InterviewQuestionFilters extends PaginationParams {
  category?: string;
  difficulty?: string;
  search?: string;
}

export const interviewQuestionApi = {
  // Get all interview questions
  getInterviewQuestions: (params?: InterviewQuestionFilters, token?: string) =>
    api.get<PaginatedResponse<InterviewQuestion>>(
      `/${BACKEND_API_VERSION}/interview-questions?` +
        new URLSearchParams(params as Record<string, string>).toString(),
      { token }
    ),

  // Get interview question by ID
  getInterviewQuestion: async (id: string, token?: string) => {
    const { data } = await api.get<{ data: InterviewQuestion }>(
      `/${BACKEND_API_VERSION}/interview-questions/${id}`,
      { token }
    );
    return data;
  },

  // Create interview question
  createInterviewQuestion: (data: CreateInterviewQuestionData, token?: string) =>
    api.post<InterviewQuestion>(`/${BACKEND_API_VERSION}/interview-questions`, data, { token }),

  // Update interview question
  updateInterviewQuestion: (id: string, data: UpdateInterviewQuestionData, token?: string) =>
    api.patch<InterviewQuestion>(`/${BACKEND_API_VERSION}/interview-questions/${id}`, data, { token }),

  // Delete interview question
  deleteInterviewQuestion: (id: string, token?: string) =>
    api.delete<void>(`/${BACKEND_API_VERSION}/interview-questions/${id}`, { token }),

  // Hard delete interview question
  hardDeleteInterviewQuestion: (id: string, token?: string) =>
    api.delete<void>(`/${BACKEND_API_VERSION}/interview-questions/${id}/hard-delete`, { token }),

  // Get random questions
  getRandomQuestions: (count: number, category?: string, token?: string) =>
    api.get<InterviewQuestion[]>(`/${BACKEND_API_VERSION}/interview-questions/random`, {
      params: { count, ...(category && { category }) },
      token,
    }),
};
