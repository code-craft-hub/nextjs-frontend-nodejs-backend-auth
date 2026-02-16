import { queryOptions } from "@tanstack/react-query";
import { autoApplyApi } from "@/lib/api/auto-apply.api";
import { autoApplyKeys } from "@/lib/query/auto-apply.keys";

export const autoApplyQueries = {
  all: (token?: string) =>
    queryOptions({
      queryKey: autoApplyKeys.lists(),
      queryFn: () => autoApplyApi.getAll(token),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string, token?: string) =>
    queryOptions({
      queryKey: autoApplyKeys.detail(id),
      queryFn: () => autoApplyApi.getById(id, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),

  recent: (limit?: number, token?: string) =>
    queryOptions({
      queryKey: autoApplyKeys.recent(limit),
      queryFn: () => autoApplyApi.getRecent(limit, token),
      staleTime: 5 * 60 * 1000,
    }),

  count: (token?: string) =>
    queryOptions({
      queryKey: autoApplyKeys.count(),
      queryFn: () => autoApplyApi.getCount(token),
      staleTime: 5 * 60 * 1000,
    }),

  byType: (type: string, token?: string) =>
    queryOptions({
      queryKey: autoApplyKeys.byType(type),
      queryFn: () => autoApplyApi.getByType(type, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!type,
    }),

  byResume: (resumeId: string, token?: string) =>
    queryOptions({
      queryKey: autoApplyKeys.byResume(resumeId),
      queryFn: () => autoApplyApi.getByResumeId(resumeId, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!resumeId,
    }),

  byCoverLetter: (coverLetterId: string, token?: string) =>
    queryOptions({
      queryKey: autoApplyKeys.byCoverLetter(coverLetterId),
      queryFn: () => autoApplyApi.getByCoverLetterId(coverLetterId, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!coverLetterId,
    }),
};
