/**
 * Email Application Query Keys
 * Defines hierarchical query key structure for React Query
 * Follows TanStack Query best practices for cache management
 */

export const emailApplicationKeys = {
  all: ["email-applications"] as const,
  lists: () => [...emailApplicationKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...emailApplicationKeys.lists(), filters] as const,
  details: () => [...emailApplicationKeys.all, "detail"] as const,
  detail: (id: string) => [...emailApplicationKeys.details(), id] as const,
  history: () => [...emailApplicationKeys.all, "history"] as const,
};
