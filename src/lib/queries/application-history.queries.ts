import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { jobApplicationsApi } from "@/lib/api/job-applications.api";
import { jobApplicationKeys } from "@/lib/query/job-applications.keys";

export const jobApplicationQueries = {
  /**
   * Single page — for non-scrolling admin or overview lists.
   */
  list: (page = 1, limit = 20, token?: string) =>
    queryOptions({
      queryKey: jobApplicationKeys.list({ page, limit }),
      queryFn: () => jobApplicationsApi.list(page, limit, token),
      staleTime: 5 * 60 * 1000,
    }),

  /**
   * Infinite scroll — drives the Application History feed.
   *
   * The backend does not expose a total count, so we use the heuristic:
   *   count < limit  →  we're on the last page
   *   count === limit →  there may be more pages
   */
  infiniteList: (limit = 20, token?: string) =>
    infiniteQueryOptions({
      queryKey: jobApplicationKeys.infinite(),
      queryFn: ({ pageParam }) =>
        jobApplicationsApi.list(pageParam, limit, token),
      getNextPageParam: (lastPage) => {
        const { page, count } = lastPage.pagination;
        return count === limit ? page + 1 : undefined;
      },
      getPreviousPageParam: (firstPage) => {
        const { page } = firstPage.pagination;
        return page > 1 ? page - 1 : undefined;
      },
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
    }),

  /**
   * Single application detail.
   */
  detail: (applicationId: string, token?: string) =>
    queryOptions({
      queryKey: jobApplicationKeys.detail(applicationId),
      queryFn: () => jobApplicationsApi.getById(applicationId, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!applicationId,
    }),

  /**
   * Existence check — drives the "Applied" badge / button state.
   * Short stale time; mutations update it optimistically.
   */
  check: (jobId: string, token?: string) =>
    queryOptions({
      queryKey: jobApplicationKeys.check(jobId),
      queryFn: () => jobApplicationsApi.check(jobId, token),
      staleTime: 30 * 1000,
      enabled: !!jobId,
    }),

  /**
   * Applications filtered by status (e.g. "applied", "rejected").
   */
  byStatus: (status: string, page = 1, limit = 20, token?: string) =>
    queryOptions({
      queryKey: jobApplicationKeys.byStatus(status, { page, limit }),
      queryFn: () =>
        jobApplicationsApi.getByStatus(status, page, limit, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!status,
    }),

  /**
   * All applications for a specific job posting.
   */
  byJob: (jobId: string, token?: string) =>
    queryOptions({
      queryKey: jobApplicationKeys.byJob(jobId),
      queryFn: () => jobApplicationsApi.getByJob(jobId, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!jobId,
    }),

  /**
   * Admin view — all applications with pagination.
   */
  adminList: (page = 1, limit = 20, token?: string) =>
    queryOptions({
      queryKey: jobApplicationKeys.adminList({ page, limit }),
      queryFn: () => jobApplicationsApi.adminList(page, limit, token),
      staleTime: 5 * 60 * 1000,
    }),
};

export default jobApplicationQueries;
