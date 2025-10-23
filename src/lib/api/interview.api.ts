// lib/api/interview.api.ts
import { api } from './client';
import type { InterviewQuestion, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface CreateInterviewQuestionData {
  question: string;
  answer?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UpdateInterviewQuestionData {
  question?: string;
  answer?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface InterviewQuestionFilters extends PaginationParams {
  category?: string;
  difficulty?: string;
  search?: string;
}

export const interviewQuestionApi = {
  // Get all interview questions
  getInterviewQuestions: (params?: InterviewQuestionFilters) =>
    api.get<PaginatedResponse<InterviewQuestion>>('/interview-questions', { params }),

  // Get interview question by ID
  getInterviewQuestion: (id: string) =>
    api.get<InterviewQuestion>(`/interview-questions/${id}`),

  // Create interview question
  createInterviewQuestion: (data: CreateInterviewQuestionData) =>
    api.post<InterviewQuestion>('/interview-questions', data),

  // Update interview question
  updateInterviewQuestion: (id: string, data: UpdateInterviewQuestionData) =>
    api.patch<InterviewQuestion>(`/interview-questions/${id}`, data),

  // Delete interview question
  deleteInterviewQuestion: (id: string) =>
    api.delete<void>(`/interview-questions/${id}`),

  // Get random questions
  getRandomQuestions: (count: number, category?: string) =>
    api.get<InterviewQuestion[]>('/interview-questions/random', { 
      params: { count, category } 
    }),
};