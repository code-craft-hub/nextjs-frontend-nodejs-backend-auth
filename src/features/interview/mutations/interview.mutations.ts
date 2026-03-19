// lib/mutations/interview.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewQuestionApi, type CreateInterviewQuestionData, type UpdateInterviewQuestionData } from '@/lib/api/interview.api';
import { queryKeys } from '@/lib/query/keys';
import type { InterviewQuestion, PaginatedResponse } from '@/lib/types';

export function useCreateInterviewQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInterviewQuestionData) => interviewQuestionApi.createInterviewQuestion(data),
    onMutate: async (newQuestion) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.interviewQuestions.lists() });

      const previousQuestions = queryClient.getQueryData(queryKeys.interviewQuestions.lists());

      queryClient.setQueriesData<PaginatedResponse<InterviewQuestion>>(
        { queryKey: queryKeys.interviewQuestions.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [
              {
                id: 'temp-' + Date.now(),
                userId: 'temp',
                ...newQuestion,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as InterviewQuestion,
              ...old.data,
            ],
            total: old.total + 1,
          };
        }
      );

      return { previousQuestions };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.interviewQuestions.lists() },
          context.previousQuestions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviewQuestions.lists() });
    },
  });
}

export function useUpdateInterviewQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInterviewQuestionData }) =>
      interviewQuestionApi.updateInterviewQuestion(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.interviewQuestions.detail(id) });

      const previousQuestion = queryClient.getQueryData(queryKeys.interviewQuestions.detail(id));

      queryClient.setQueryData<InterviewQuestion>(queryKeys.interviewQuestions.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      queryClient.setQueriesData<PaginatedResponse<InterviewQuestion>>(
        { queryKey: queryKeys.interviewQuestions.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((q) =>
              q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString() } : q
            ),
          };
        }
      );

      return { previousQuestion };
    },
    onError: (_err,  { id }, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(queryKeys.interviewQuestions.detail(id), context.previousQuestion);
      }
    },
    onSettled: (_err, _id, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviewQuestions.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.interviewQuestions.lists() });
    },
  });
}

export function useDeleteInterviewQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => interviewQuestionApi.deleteInterviewQuestion(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.interviewQuestions.lists() });

      const previousQuestions = queryClient.getQueryData(queryKeys.interviewQuestions.lists());

      queryClient.setQueriesData<PaginatedResponse<InterviewQuestion>>(
        { queryKey: queryKeys.interviewQuestions.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((q) => q.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousQuestions };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.interviewQuestions.lists() },
          context.previousQuestions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.interviewQuestions.lists() });
    },
  });
}