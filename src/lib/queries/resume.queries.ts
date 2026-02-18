// lib/queries/resume.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { resumeApi, type ResumeFilters } from '@/lib/api/resume.api';
import { queryKeys } from '@/lib/query/keys';

export const resumeQueries = {
  all: (params: ResumeFilters = {}, token?:string) =>
    queryOptions({
      queryKey: queryKeys.resumes.list(params),
      queryFn: () => resumeApi.getResumes(params, token),
      staleTime: 5 * 60 * 1000,
    }),

  uploaded: (params: ResumeFilters = {}, token?: string) =>
    queryOptions({
      queryKey: queryKeys.resumes.uploaded(params),
      queryFn: () => resumeApi.listUploaded(params, token),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string, token?: string) =>
    queryOptions({
      queryKey: queryKeys.resumes.detail(id),
      queryFn: () => resumeApi.getResume(id, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};