// lib/queries/interview.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { interviewQuestionApi, type InterviewQuestionFilters } from '@/lib/api/interview.api';
import { queryKeys } from '@/lib/query/keys';

export const interviewQuestionQueries = {
  all: (params: InterviewQuestionFilters = {}) =>
    queryOptions({
      queryKey: queryKeys.interviewQuestions.list(params),
      queryFn: () => interviewQuestionApi.getInterviewQuestions(params),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.interviewQuestions.detail(id),
      queryFn: () => interviewQuestionApi.getInterviewQuestion(id),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};