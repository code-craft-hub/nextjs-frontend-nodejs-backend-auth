import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coverLetterApi, type CreateCoverLetterData, type UpdateCoverLetterData } from '@/lib/api/cover-letter.api';
import { queryKeys } from '@/lib/query/keys';
import type { PaginatedResponse } from '@/lib/types';
import { CoverLetter } from '@/types';

export function useCreateCoverLetterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCoverLetterData) => coverLetterApi.createCoverLetter(data),
    onMutate: async (newCoverLetter) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.coverLetters.lists() });

      const previousCoverLetters = queryClient.getQueryData(queryKeys.coverLetters.lists());

      queryClient.setQueriesData<PaginatedResponse<CoverLetter>>(
        { queryKey: queryKeys.coverLetters.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [
              {
                id: 'temp-' + Date.now(),
                userId: 'temp',
                ...newCoverLetter,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as any,
              ...old.data,
            ],
            total: old.total + 1,
          };
        }
      );

      return { previousCoverLetters };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCoverLetters) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.coverLetters.lists() },
          context.previousCoverLetters
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coverLetters.lists() });
    },
  });
}

export function useUpdateCoverLetterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCoverLetterData }) =>
      coverLetterApi.updateCoverLetter(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.coverLetters.detail(id) });

      const previousCoverLetter = queryClient.getQueryData(queryKeys.coverLetters.detail(id));

      queryClient.setQueryData<CoverLetter>(queryKeys.coverLetters.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      queryClient.setQueriesData<PaginatedResponse<CoverLetter>>(
        { queryKey: queryKeys.coverLetters.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((cl) =>
              cl.id === id ? { ...cl, ...data, updatedAt: new Date().toISOString() } : cl
            ),
          };
        }
      );

      return { previousCoverLetter };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousCoverLetter) {
        queryClient.setQueryData(queryKeys.coverLetters.detail(id), context.previousCoverLetter);
      }
    },
    onSettled: (_err, _id, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coverLetters.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.coverLetters.lists() });
    },
  });
}

export function useDeleteCoverLetterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coverLetterApi.deleteCoverLetter(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.coverLetters.lists() });

      const previousCoverLetters = queryClient.getQueryData(queryKeys.coverLetters.lists());

      queryClient.setQueriesData<PaginatedResponse<CoverLetter>>(
        { queryKey: queryKeys.coverLetters.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((cl) => cl.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousCoverLetters };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCoverLetters) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.coverLetters.lists() },
          context.previousCoverLetters
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coverLetters.lists() });
    },
  });
}

export function useDuplicateCoverLetterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coverLetterApi.duplicateCoverLetter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coverLetters.lists() });
    },
  });
}