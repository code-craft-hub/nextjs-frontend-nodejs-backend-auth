import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import { jobApplicationsApi } from "@/lib/api/job-applications.api";
import { queryKeys } from "@/lib/query/keys";

export const jobApplicationQueries = {
  // Get authenticated user's applications (paginated)
  userList: (params: Record<string, any> = {}, token?: string) =>
    queryOptions({
      queryKey: queryKeys.jobApplications.list(params),
      queryFn: () => jobApplicationsApi.list(params, token),
      staleTime: 5 * 60 * 1000,
    }),

  userInfinite: (params: Record<string, any> = {}, token?: string) =>
    infiniteQueryOptions({
      queryKey: [...queryKeys.jobApplications.lists(), "infinite", params],
      queryFn: ({ pageParam }) =>
        jobApplicationsApi.list(
          { ...params, page: pageParam, limit: params.limit || 20 },
          token,
        ),
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
      getPreviousPageParam: (firstPage) =>
        firstPage.page > 1 ? firstPage.page - 1 : undefined,
      initialPageParam: 1,
      staleTime: 5 * 60 * 1000,
    }),

  detail: (id: string, token?: string) =>
    queryOptions({
      queryKey: queryKeys.jobApplications.detail(id),
      queryFn: () => jobApplicationsApi.getById(id, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
    }),

  check: (jobId: string, token?: string) =>
    queryOptions({
      queryKey: queryKeys.jobApplications.check("me", jobId),
      queryFn: () => jobApplicationsApi.check(jobId, token),
      staleTime: 30 * 1000,
      enabled: !!jobId,
    }),

  byStatus: (
    status: string,
    params: Record<string, any> = {},
    token?: string,
  ) =>
    queryOptions({
      queryKey: queryKeys.jobApplications.status(status, params),
      queryFn: () => jobApplicationsApi.getByStatus(status, params, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!status,
    }),

  byJob: (jobId: string, token?: string) =>
    queryOptions({
      queryKey: queryKeys.jobApplications.job(jobId),
      queryFn: () => jobApplicationsApi.getByJob(jobId, token),
      staleTime: 5 * 60 * 1000,
      enabled: !!jobId,
    }),

  adminList: (params: Record<string, any> = {}, token?: string) =>
    queryOptions({
      queryKey: queryKeys.jobApplications.adminList(params),
      queryFn: () => jobApplicationsApi.adminList(params, token),
      staleTime: 5 * 60 * 1000,
    }),
};

export default jobApplicationQueries;
