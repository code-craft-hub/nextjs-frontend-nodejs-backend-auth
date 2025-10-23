// lib/queries/auth.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { queryKeys } from '@/lib/query/keys';

export const authQueries = {
  session: () =>
    queryOptions({
      queryKey: queryKeys.auth.session(),
      queryFn: authApi.getSession,
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: false, // Don't retry auth failures
    }),

  profile: () =>
    queryOptions({
      queryKey: queryKeys.auth.profile(),
      queryFn: authApi.getProfile,
      staleTime: 10 * 60 * 1000,
      retry: false,
    }),
};