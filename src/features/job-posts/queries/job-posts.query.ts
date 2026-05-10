import { useInfiniteQuery, queryOptions, infiniteQueryOptions, type InfiniteData } from "@tanstack/react-query";
import { jobPostsKeys } from "./job-post.keys";
import jobPostsApi from "../api/job-posts.api";
import type { InfiniteJobsResponse } from "../types";

export const jobPostsQueries = {
  list: (params: Record<string, any> = {}, token?: string) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.list(params),
      queryFn: () => jobPostsApi.list(params, token),
      staleTime: 10 * 60 * 1000,
    }),

  infinite: (
    query?: string,
    location?: string,
    localizedTo?: string,
    classification?: string,
    token?: string,
  ) =>
    infiniteQueryOptions<
      InfiniteJobsResponse,
      Error,
      { pages: InfiniteJobsResponse["items"]; pageParams: (string | undefined)[] },
      ReturnType<typeof jobPostsKeys.jobPosts.infinite>,
      string | undefined
    >({
      queryKey: jobPostsKeys.jobPosts.infinite(query, location, localizedTo, classification),
      queryFn: ({ pageParam }) =>
        jobPostsApi.query(
          { query, cursor: pageParam, location, localizedTo, classification },
          token,
        ),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      select: (data) => ({
        pages: data.pages.flatMap((page) => page.items),
        pageParams: data.pageParams,
      }),
      placeholderData: (previousData) => previousData,
      retry: 1,
    }),

  search: (params: Record<string, any> = {}, token?: string) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.search(params.q || ""),
      queryFn: () => jobPostsApi.search(params, token),
      staleTime: 30 * 1000,
      enabled: !!params.q && String(params.q).trim().length >= 2,
    }),

  fullTextSearch: (q: string, page = 1, limit = 20, token?: string) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.fts(q),
      queryFn: () => jobPostsApi.fullTextSearch(q, page, limit, token),
      staleTime: 30 * 1000,
      enabled: !!q && q.trim().length > 0,
    }),

  active: (params: Record<string, any> = {}, token?: string) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.active(),
      queryFn: () => jobPostsApi.getActiveJobs(params, token),
      staleTime: 5 * 60 * 1000,
    }),

  unprocessed: (limit = 100, token?: string) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.unprocessed(),
      queryFn: () => jobPostsApi.getUnprocessed(limit, token),
      staleTime: 5 * 60 * 1000,
    }),

  stats: (token?: string) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.stats(),
      queryFn: () => jobPostsApi.getStats(token),
      staleTime: 5 * 60 * 1000,
    }),

  byCompany: (
    companyName: string,
    params: Record<string, any> = {},
    token?: string,
  ) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.company(companyName, params),
      queryFn: () => jobPostsApi.getByCompany(companyName, params, token),
      staleTime: 10 * 60 * 1000,
      enabled: !!companyName,
    }),

  byLocation: (
    location: string,
    params: Record<string, any> = {},
    token?: string,
  ) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.location(location, params),
      queryFn: () => jobPostsApi.getByLocation(location, params, token),
      staleTime: 10 * 60 * 1000,
      enabled: !!location,
    }),

  detail: (id: string, token?: string) =>
    queryOptions({
      queryKey: jobPostsKeys.jobPosts.detail(id),
      queryFn: () => jobPostsApi.getById(id, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),

  preferenceSearch: (params: {
    q?: string;
    employmentTypes?: string;
    workArrangements?: string;
    preferredLocations?: string;
  }) =>
    infiniteQueryOptions<
      InfiniteJobsResponse,
      Error,
      InfiniteData<InfiniteJobsResponse>,
      ReturnType<typeof jobPostsKeys.jobPosts.preferenceSearch>,
      string | undefined
    >({
      queryKey: jobPostsKeys.jobPosts.preferenceSearch(params),
      queryFn: ({ pageParam }) =>
        jobPostsApi.query({
          query: params.q,
          cursor: pageParam,
          employmentTypes: params.employmentTypes,
          workArrangements: params.workArrangements,
          preferredLocations: params.preferredLocations,
        }),
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!(params.q || params.employmentTypes || params.workArrangements || params.preferredLocations),
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      placeholderData: (prev) => prev,
    }),

  // Mutation helpers (to be used with useMutation)
  create: (data: any, token?: string) => ({
    mutationFn: () => jobPostsApi.create(data, token),
  }),
  createMany: (items: any[], token?: string) => ({
    mutationFn: () => jobPostsApi.createMany(items, token),
  }),
  update: (id: string, data: any, token?: string) => ({
    mutationFn: () => jobPostsApi.update(id, data, token),
  }),
  markAsProcessed: (id: string, token?: string) => ({
    mutationFn: () => jobPostsApi.markAsProcessed(id, token),
  }),
  remove: (id: string, token?: string) => ({
    mutationFn: () => jobPostsApi.delete(id, token),
  }),
};

export function useInfiniteJobs(
  query?: string,
  location?: string,
  localizedTo?: string,
  classification?: string,
) {
  return useInfiniteQuery(
    jobPostsQueries.infinite(query, location, localizedTo, classification),
  );
}
