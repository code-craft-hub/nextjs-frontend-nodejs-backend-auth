// lib/queries/resume.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { AIApplyApi } from '../api/ai-apply.api';

export const aiApplyQueries = {
  all: (params: any = {}, token?: string) =>
    queryOptions({
      queryKey: queryKeys.aiApply.list(params),
      queryFn: () => AIApplyApi.getAIApplys(params, token),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string, token?: string) =>
    queryOptions({
      queryKey: queryKeys.aiApply.detail(id),
      queryFn: () => AIApplyApi.getAIApply(id, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};