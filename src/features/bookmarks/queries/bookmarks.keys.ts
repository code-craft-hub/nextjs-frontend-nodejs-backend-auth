export const bookmarkKeys = {
  all: ["bookmarks"] as const,

  // List variants (paginated)
  lists: () => [...bookmarkKeys.all, "list"] as const,
  list: (params: { limit?: number }) =>
    [...bookmarkKeys.lists(), params] as const,

  // Infinite scroll variant
  infinite: () => [...bookmarkKeys.all, "infinite"] as const,

  // Single bookmark
  details: () => [...bookmarkKeys.all, "detail"] as const,
  detail: (bookmarkId: string) =>
    [...bookmarkKeys.details(), bookmarkId] as const,

  // Existence check per job
  checks: () => [...bookmarkKeys.all, "check"] as const,
  check: (jobId: string) => [...bookmarkKeys.checks(), jobId] as const,
} as const;
