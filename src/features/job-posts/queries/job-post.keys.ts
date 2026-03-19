export const jobPostsKeys = {
  jobPosts: {
    all: ["job-posts"] as const,
    lists: () => [...jobPostsKeys.jobPosts.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...jobPostsKeys.jobPosts.lists(), filters] as const,
    infinite: (query?: string) =>
      [
        ...jobPostsKeys.jobPosts.all,
        "infinite",
        ...(query ? [query] : []),
      ] as const,
    details: () => [...jobPostsKeys.jobPosts.all, "detail"] as const,
    detail: (id: string) => [...jobPostsKeys.jobPosts.details(), id] as const,
    stats: () => [...jobPostsKeys.jobPosts.all, "stats"] as const,
    search: (q: string) => [...jobPostsKeys.jobPosts.all, "search", q] as const,
    fts: (q: string) => [...jobPostsKeys.jobPosts.all, "fts", q] as const,
    active: () => [...jobPostsKeys.jobPosts.all, "active"] as const,
    unprocessed: () => [...jobPostsKeys.jobPosts.all, "unprocessed"] as const,
    company: (companyName: string, params?: Record<string, any>) =>
      [...jobPostsKeys.jobPosts.all, "company", companyName, params] as const,
    location: (location: string, params?: Record<string, any>) =>
      [...jobPostsKeys.jobPosts.all, "location", location, params] as const,
  },
};
