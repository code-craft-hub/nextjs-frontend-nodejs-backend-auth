import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user.api";
import { queryKeys } from "@/lib/query/keys";
import type { PaginationParams } from "@/lib/types";

export const userQueryKeys = {
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: () => [...queryKeys.users.details(), "user"] as const,
    infinite: (params: Omit<PaginationParams, "page">) =>
      [...queryKeys.users.all, "infinite", params] as const,
  },
};

export const userQueries = {
  all: (params: PaginationParams = {}) =>
    queryOptions({
      queryKey: queryKeys.users.list(params),
      queryFn: () => userApi.getUsers(params),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (token?: string) =>
    queryOptions({
      queryKey: queryKeys.users.detail(),
      queryFn: () => userApi.getUser(token),
      staleTime: 10 * 60 * 1000,
      // refetchInterval: 1000,
    }),
};


// ─── User Queries ───────────────────────────────────────────

export const invalidateUserLists = () => {
  const qc = useQueryClient();
  return Promise.all([
    qc.invalidateQueries({
      queryKey: queryKeys.users.details(),
    }),
    qc.invalidateQueries({
      queryKey: queryKeys.users.lists(),
    }),
  ]);
};
export const invalidateUserQueries = () => {
  const qc = useQueryClient();

  return Promise.all([
    qc.invalidateQueries({
      queryKey: queryKeys.users.details(),
    }),
    qc.invalidateQueries({
      queryKey: queryKeys.users.lists(),
    }),
  ]);
};

export const invalidateUserDetail = () => {
  const qc = useQueryClient();
  return qc.invalidateQueries({
    queryKey: queryKeys.users.details(),
  });
};

