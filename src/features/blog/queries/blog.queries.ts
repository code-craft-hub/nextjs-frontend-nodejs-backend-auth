// lib/queries/blog.queries.ts
import { queryOptions } from "@tanstack/react-query";
import { blogApi, type BlogFilters } from "@/features/blog/api/blog.api";
import { queryKeys } from "@/shared/query/keys";

export const blogQueries = {
  /** Paginated, filterable blog list. */
  list: (params: BlogFilters = {}) =>
    queryOptions({
      queryKey: queryKeys.blogs.list(params),
      queryFn: () => blogApi.getBlogs(params),
      staleTime: 3 * 60 * 1000,
    }),

  /** Published blogs only (public feed). */
  published: (params: Omit<BlogFilters, "status"> = {}) =>
    queryOptions({
      queryKey: queryKeys.blogs.published(),
      queryFn: () => blogApi.getBlogs({ ...params, status: "publish" }),
      staleTime: 10 * 60 * 1000,
    }),

  /** Single blog post. Fetching auto-records a view server-side. */
  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.blogs.detail(id),
      queryFn: () => blogApi.getBlog(id),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),

  /** Aggregate stats for the dashboard. */
  stats: () =>
    queryOptions({
      queryKey: queryKeys.blogs.stats(),
      queryFn: () => blogApi.getStats(),
      staleTime: 60 * 1000, // 1 minute — stats change frequently
    }),

  /** Per-blog daily view history. */
  viewHistory: (id: string, days = 30) =>
    queryOptions({
      queryKey: queryKeys.blogs.viewHistory(id),
      queryFn: () => blogApi.getViewHistory(id, days),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),
};