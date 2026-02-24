import { useInfiniteQuery } from "@tanstack/react-query";
import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
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

  infinite: (params: Record<string, any> = {}, token?: string) =>
    infiniteQueryOptions({
      queryKey: [...jobPostsKeys.jobPosts.lists(), "infinite", params],
      queryFn: ({ pageParam }) =>
        jobPostsApi.list(
          { ...params, page: pageParam, limit: params.limit || 20 },
          token,
        ),
      getNextPageParam: (lastPage) => {
        if (!lastPage?.data || lastPage.data.length === 0) return undefined;
        return lastPage.page < lastPage.totalPages
          ? lastPage.page + 1
          : undefined;
      },
      getPreviousPageParam: (firstPage) =>
        firstPage.page > 1 ? firstPage.page - 1 : undefined,
      initialPageParam: 1,
      staleTime: 10 * 60 * 1000,
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

export function useInfiniteJobs(query?: string) {
  return useInfiniteQuery<
    InfiniteJobsResponse,
    Error,
    {
      pages: InfiniteJobsResponse["items"];
      pageParams: (string | undefined)[];
    },
    ReturnType<typeof jobPostsKeys.jobPosts.infinite>,
    string | undefined
  >({
    queryKey: jobPostsKeys.jobPosts.infinite(query),
    queryFn: ({ pageParam }) => jobPostsApi.query({ query, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    select: (data) => {
      return {
        pages: data.pages.flatMap((page) => page.items),
        pageParams: data.pageParams,
      };
    },
    placeholderData: (previousData) => previousData,
    retry: 1,
  });
}
