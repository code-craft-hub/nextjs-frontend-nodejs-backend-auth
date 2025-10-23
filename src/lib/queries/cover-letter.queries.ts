// lib/queries/cover-letter.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { coverLetterApi, type CoverLetterFilters } from '@/lib/api/cover-letter.api';
import { queryKeys } from '@/lib/query/keys';

export const coverLetterQueries = {
  all: (params: CoverLetterFilters = {}) =>
    queryOptions({
      queryKey: queryKeys.coverLetters.list(params),
      queryFn: () => coverLetterApi.getCoverLetters(params),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.coverLetters.detail(id),
      queryFn: () => coverLetterApi.getCoverLetter(id),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};