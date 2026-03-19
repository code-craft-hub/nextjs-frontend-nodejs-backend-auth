export const jobApplicationKeys = {
  all: ["job-applications"] as const,

  // Paginated list variants
  lists: () => [...jobApplicationKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...jobApplicationKeys.lists(), params] as const,

  // Infinite scroll variant
  infinite: () => [...jobApplicationKeys.all, "infinite"] as const,

  // Single application
  details: () => [...jobApplicationKeys.all, "detail"] as const,
  detail: (applicationId: string) =>
    [...jobApplicationKeys.details(), applicationId] as const,

  // Existence check per job
  checks: () => [...jobApplicationKeys.all, "check"] as const,
  check: (jobId: string) => [...jobApplicationKeys.checks(), jobId] as const,

  // Filtered views
  byStatus: (status: string, params?: Record<string, unknown>) =>
    [...jobApplicationKeys.all, "status", status, params] as const,
  byJob: (jobId: string) =>
    [...jobApplicationKeys.all, "job", jobId] as const,

  // Admin
  adminList: (params?: Record<string, unknown>) =>
    [...jobApplicationKeys.all, "admin", "list", params] as const,
} as const;
