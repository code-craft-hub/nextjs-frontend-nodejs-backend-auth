// lib/api/interview.api.ts
import { api } from "./client";
import type {
  InterviewQuestion,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types";

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
  getInterviewQuestions: (params?: InterviewQuestionFilters) =>
    api.get<PaginatedResponse<InterviewQuestion>>(
      "/interview-question/paginated?" +
        new URLSearchParams(params as Record<string, string>).toString()
    ),

  // Get interview question by ID
  getInterviewQuestion: async (id: string) => {
    const { data } = await api.get<{ data: InterviewQuestion }>(
      `/interview-question/${id}`
    );
    return data;
  },

  // Create interview question
  createInterviewQuestion: (data: CreateInterviewQuestionData) =>
    api.post<InterviewQuestion>("/interview-question", data),

  // Update interview question
  updateInterviewQuestion: (id: string, data: UpdateInterviewQuestionData) =>
    api.patch<InterviewQuestion>(`/interview-question/${id}`, data),

  // Delete interview question
  deleteInterviewQuestion: (id: string) =>
    api.delete<void>(`/interview-question/${id}`),

  // Get random questions
  getRandomQuestions: (count: number, category?: string) =>
    api.get<InterviewQuestion[]>("/interview-question/random", {
      params: { count, ...(category && { category }) },
    }),
};
