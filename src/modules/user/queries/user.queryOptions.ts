import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { queryKeys } from "@/lib/query/keys";
import type { PaginationParams } from "@/lib/types";

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
    }),
};

// ─── Invalidation Helpers ──────────────────────────────────

export const invalidateUserLists = (qc: QueryClient) => {
  return Promise.all([
    qc.invalidateQueries({
      queryKey: queryKeys.users.details(),
    }),
    qc.invalidateQueries({
      queryKey: queryKeys.users.lists(),
    }),
  ]);
};

export const invalidateUserQueries = (qc: QueryClient) => {
  return Promise.all([
    qc.invalidateQueries({
      queryKey: queryKeys.users.details(),
    }),
    qc.invalidateQueries({
      queryKey: queryKeys.users.lists(),
    }),
  ]);
};

export const invalidateUserDetail = (qc: QueryClient) => {
  return qc.invalidateQueries({
    queryKey: queryKeys.users.details(),
  });
};
