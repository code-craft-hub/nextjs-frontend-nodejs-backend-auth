import { queryOptions } from "@tanstack/react-query";
import { userApi } from "@/lib/api/user.api";
import { queryKeys } from "@/lib/query/keys";
import type { PaginationParams } from "@/lib/types";

export const userQueries = {
  all: (params: PaginationParams = {}) =>
    queryOptions({
      queryKey: queryKeys.users.list(params),
      queryFn: () => userApi.getUsers(params),
      staleTime: 5 * 60 * 1000,
    }),

  detail: () =>
    queryOptions({
      queryKey: queryKeys.users.detail(),
      queryFn: () => userApi.getUser(),
      staleTime: 5 * 60 * 1000,
    }),
};
