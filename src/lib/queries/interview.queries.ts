// lib/queries/interview.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { interviewQuestionApi, type InterviewQuestionFilters } from '@/lib/api/interview.api';
import { queryKeys } from '@/lib/query/keys';

export const interviewQuestionQueries = {
  all: (params: InterviewQuestionFilters = {}, token?: string) =>
    queryOptions({
      queryKey: queryKeys.interviewQuestions.list(params),
      queryFn: () => interviewQuestionApi.getInterviewQuestions(params, token),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string, token?: string) =>
    queryOptions({
      queryKey: queryKeys.interviewQuestions.detail(id),
      queryFn: () => interviewQuestionApi.getInterviewQuestion(id, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};