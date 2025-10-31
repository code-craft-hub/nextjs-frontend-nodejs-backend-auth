// lib/queries/jobs.queries.ts
import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs.api";
import { queryKeys } from "@/lib/query/keys";
import type { JobFilters } from "@/lib/types/jobs";
import { normalizeJobFilters } from "../query/normalize-filters";

export const jobsQueries = {
  all: (filters: JobFilters = {}) => {
    const normalized = normalizeJobFilters(filters);
    return queryOptions({
      queryKey: queryKeys.jobs.list(normalized), // Use normalized
      queryFn: () => jobsApi.getJobs(normalized),
      staleTime: 10 * 60 * 1000,
    });
  },
  infinite: (filters: Omit<JobFilters, "page">) => {
    const baseFilters = normalizeJobFilters(filters as JobFilters);
    return infiniteQueryOptions({
      queryKey: [...queryKeys.jobs.lists(), "infinite", baseFilters],
      queryFn: ({ pageParam }) => {
        // console.log("Fetching page:", pageParam, "with filters:", baseFilters);

        return jobsApi.getJobs({
          ...baseFilters,
          page: pageParam,
          limit: baseFilters.limit || 20,
        });
      },
      getNextPageParam: (
        lastPage
        // allPages, lastPageParam
      ) => {
        // console.log("Last page info:", { lastPage, allPages, lastPageParam });
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      getPreviousPageParam: (firstPage) => {
        // console.log("First page info:", firstPage);
        if (firstPage.page > 1) {
          return firstPage.page - 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      staleTime: 10 * 60 * 60 * 1000, // Match your regular query staleTime
    });
  },

  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.jobs.detail(id),
      queryFn: () => jobsApi.getJob(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!id,
    }),

  // Job stats (for analytics dashboard)
  stats: () =>
    queryOptions({
      queryKey: queryKeys.jobs.stats(),
      queryFn: jobsApi.getJobStats,
      staleTime: 5 * 60 * 1000,
    }),

  // Search with debouncing support
  search: (query: string) =>
    queryOptions({
      queryKey: queryKeys.jobs.search(query),
      queryFn: () => jobsApi.searchJobs(query),
      staleTime: 30 * 1000, // 30 seconds for search
      enabled: query.length >= 2, // Only search with 2+ characters
    }),

  // Similar jobs (recommendation)
  similar: (id: string) =>
    queryOptions({
      queryKey: queryKeys.jobs.similar(id),
      queryFn: () => jobsApi.getSimilarJobs(id),
      staleTime: 10 * 60 * 1000, // 10 minutes
      enabled: !!id,
    }),

  // Filter options (for faceted search)
  filters: () =>
    queryOptions({
      queryKey: queryKeys.jobs.filters(),
      queryFn: jobsApi.getFilterOptions,
      staleTime: 15 * 60 * 1000, // 15 minutes - rarely changes
    }),
};
// infinite: (filters: JobFilters = {}) =>
//   infiniteQueryOptions({
//     queryKey: [...queryKeys.jobs.lists(), 'infinite', filters],
//     queryFn: ({ pageParam = 1 }) =>
//       jobsApi.getJobs({ ...filters, page: pageParam, limit: 20 }),
//     getNextPageParam: (lastPage) => {
//       if (lastPage.page < lastPage.totalPages) {
//         return lastPage.page + 1;
//       }
//       return undefined;
//     },
//     getPreviousPageParam: (firstPage) => {
//       if (firstPage.page > 1) {
//         return firstPage.page - 1;
//       }
//       return undefined;
//     },
//     initialPageParam: 1,
//     staleTime: 2 * 60 * 1000,
//   }),

// Job detail
