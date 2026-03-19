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
