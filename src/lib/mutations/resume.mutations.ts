// lib/mutations/resume.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeApi, type CreateResumeData, type UpdateResumeData } from '@/lib/api/resume.api';
import { queryKeys } from '@/lib/query/keys';
import type { Resume, PaginatedResponse } from '@/lib/types';

export function useCreateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResumeData) => resumeApi.createResume(data),
    onMutate: async (newResume) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.resumes.lists() });

      const previousResumes = queryClient.getQueryData(queryKeys.resumes.lists());

      queryClient.setQueriesData<PaginatedResponse<Resume>>(
        { queryKey: queryKeys.resumes.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [
              {
                id: 'temp-' + Date.now(),
                userId: 'temp',
                ...newResume,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Resume,
              ...old.data,
            ],
            total: old.total + 1,
          };
        }
      );

      return { previousResumes };
    },
    onError: (err, variables, context) => {
      if (context?.previousResumes) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.resumes.lists() },
          context.previousResumes
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() });
    },
  });
}

export function useUpdateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResumeData }) =>
      resumeApi.updateResume(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.resumes.detail(id) });

      const previousResume = queryClient.getQueryData(queryKeys.resumes.detail(id));

      queryClient.setQueryData<Resume>(queryKeys.resumes.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      queryClient.setQueriesData<PaginatedResponse<Resume>>(
        { queryKey: queryKeys.resumes.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((r) =>
              r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
            ),
          };
        }
      );

      return { previousResume };
    },
    onError: (err, { id }, context) => {
      if (context?.previousResume) {
        queryClient.setQueryData(queryKeys.resumes.detail(id), context.previousResume);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() });
    },
  });
}

export function useDeleteResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.resumes.lists() });

      const previousResumes = queryClient.getQueryData(queryKeys.resumes.lists());

      queryClient.setQueriesData<PaginatedResponse<Resume>>(
        { queryKey: queryKeys.resumes.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((r) => r.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousResumes };
    },
    onError: (err, id, context) => {
      if (context?.previousResumes) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.resumes.lists() },
          context.previousResumes
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() });
    },
  });
}

export function useDuplicateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumeApi.duplicateResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.lists() });
    },
  });
}