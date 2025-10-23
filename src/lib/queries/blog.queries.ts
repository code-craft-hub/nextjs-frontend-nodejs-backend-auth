// lib/queries/blog.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { blogApi, type BlogFilters } from '@/lib/api/blog.api';
import { queryKeys } from '@/lib/query/keys';
import type { PaginationParams } from '@/lib/types';

export const blogQueries = {
  all: (params: BlogFilters = {}) =>
    queryOptions({
      queryKey: queryKeys.blogs.list(params),
      queryFn: () => blogApi.getBlogs(params),
      staleTime: 3 * 60 * 1000, // 3 minutes for blog lists
    }),

  published: (params: PaginationParams = {}) =>
    queryOptions({
      queryKey: queryKeys.blogs.published(),
      queryFn: () => blogApi.getPublishedBlogs(params),
      staleTime: 10 * 60 * 1000, // 10 minutes for public content
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: queryKeys.blogs.detail(id),
      queryFn: () => blogApi.getBlog(id),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),

  bySlug: (slug: string) =>
    queryOptions({
      queryKey: [...queryKeys.blogs.all, 'slug', slug],
      queryFn: () => blogApi.getBlogBySlug(slug),
      staleTime: 10 * 60 * 1000,
      enabled: !!slug,
    }),
};