// lib/queries/jobs.queries.ts
import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs.api";
import { queryKeys } from "@/lib/query/keys";
import type { JobFilters } from "@/lib/types/jobs";
import { normalizeJobFilters } from "../query/normalize-filters";
import recommendationsApi from "../api/recommendations.api";

export const jobsQueries = {
  all: (filters: JobFilters = {}, token?: string) => {
    const normalized = normalizeJobFilters(filters);
    return queryOptions({
      queryKey: queryKeys.jobs.list(normalized),
      queryFn: () => recommendationsApi.getRecommendations(normalized, token),
      staleTime: 10 * 60 * 1000,
    });
  },

  infinite: (filters: Omit<JobFilters, "page">, token?: string) => {
    const baseFilters = normalizeJobFilters(filters as JobFilters);
    return infiniteQueryOptions({
      queryKey: [...queryKeys.jobs.lists(), "infinite", baseFilters],
      queryFn: ({ pageParam }) => {
        return jobsApi.getJobs(
          {
            ...baseFilters,
            page: pageParam,
            limit: baseFilters.limit || 20,
          },
          token
        );
      },
      getNextPageParam: (lastPage) => {

        if (!lastPage?.data || lastPage.data.length === 0) {
          return undefined;
        }

        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }

        return undefined;
      },
      getPreviousPageParam: (firstPage) => {
        if (firstPage.page > 1) {
          return firstPage.page - 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      staleTime: 10 * 60 * 60 * 1000, // Match your regular query staleTime
    });
  },

  autoApply: () => {
    return queryOptions({
      queryKey: queryKeys.jobs.autoApply(),
      queryFn: () => jobsApi.autoApply(),
      staleTime: 10 * 60 * 1000,
      refetchInterval: (query) => {
        const recommendations = query.state.data?.data?.recommendations;
        // Poll every 5 seconds while recommendations are being built (no data)
        // Stop polling once data is available
        if (!recommendations || recommendations.length === 0) {
          return 5000;
        }
        return false;
      },
    });
  },

  // Infinite scroll version for auto-apply jobs (uses paginated endpoint)
  autoApplyInfinite: (
    filters: Omit<JobFilters, "page"> = {},
    token?: string
  ) => {
    const baseFilters = normalizeJobFilters(filters as JobFilters);
    return infiniteQueryOptions({
      queryKey: [...queryKeys.jobs.auto(baseFilters), "infinite"],
      queryFn: ({ pageParam }) => {
        return jobsApi.autoApplyGet(
          {
            ...baseFilters,
            page: pageParam,
            limit: baseFilters.limit || 20,
          },
          token
        );
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      getPreviousPageParam: (firstPage) => {
        if (firstPage.page > 1) {
          return firstPage.page - 1;
        }
        return undefined;
      },
      initialPageParam: 1,
      staleTime: 10 * 60 * 1000,
    });
  },

  bookmarked: (
    bookmarkedIds: string[],
    searchValue: string = "",
    limit: number = 20,
    token?: string
  ) => {
    return infiniteQueryOptions({
      queryKey: ["jobs", "bookmarked", bookmarkedIds, searchValue, limit],
      queryFn: ({ pageParam }) => {
        const normalized = normalizeJobFilters({
          bookmarkedIds,
          searchValue,
          limit,
        });

        return jobsApi.getBookmarkedJobs(
          normalized.bookmarkedIds,
          pageParam,
          normalized.limit,
          normalized.searchValue,
          token
        );
      },
      getNextPageParam: (lastPage) => {
        const page = lastPage.page;
        const totalPages = lastPage.totalPages;
        return page < totalPages ? page + 1 : undefined;
      },
      getPreviousPageParam: (firstPage) => {
        const page = firstPage.page;
        return page > 1 ? page - 1 : undefined;
      },
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
      enabled: bookmarkedIds.length > 0,
    });
  },

  appliedJobs: (
    appliedjobsIds: string[],
    searchValue: string = "",
    limit: number = 20,
    token?: string
  ) => {
    return infiniteQueryOptions({
      queryKey: ["jobs", "appliedJobs", appliedjobsIds, searchValue, limit],
      queryFn: ({ pageParam }) => {
        const normalized = normalizeJobFilters({
          appliedjobsIds,
          searchValue,
          limit,
        });

        return jobsApi.getAppliedJobs(
          normalized.appliedjobsIds,
          pageParam,
          normalized.limit,
          normalized.searchValue,
          token
        );
      },
      getNextPageParam: (lastPage) => {
        const page = lastPage.page;
        const totalPages = lastPage.totalPages;
        return page < totalPages ? page + 1 : undefined;
      },
      getPreviousPageParam: (firstPage) => {
        const page = firstPage.page;
        return page > 1 ? page - 1 : undefined;
      },
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
      enabled: appliedjobsIds.length > 0,
    });
  },

  detail: (id: string, token?: string) =>
    queryOptions({
      queryKey: queryKeys.jobs.detail(id),
      queryFn: () => jobsApi.getJob(id, token),
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

  filters: () =>
    queryOptions({
      queryKey: queryKeys.jobs.filters(),
      queryFn: jobsApi.getFilterOptions,
      staleTime: 15 * 60 * 1000, // 15 minutes - rarely changes
    }),
};
