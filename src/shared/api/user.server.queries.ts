// lib/queries/user.server.queries.ts
import { queryOptions } from "@tanstack/react-query";
import { userServerApi } from "@/lib/api/user.server.api";
import { queryKeys } from "@/lib/query/keys";
import type { PaginationParams } from "@/lib/types";

export const userServerQueries = {
  all: (params: PaginationParams = {}) =>
    queryOptions({
      queryKey: queryKeys.users.list(params),
      queryFn: () => userServerApi.getUsers(params),
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.users.detail(),
      queryFn: () => userServerApi.getUser(),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};