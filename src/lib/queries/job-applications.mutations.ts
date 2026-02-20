import { QueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { jobApplicationsApi } from "@/lib/api/job-applications.api";
import { invalidateJobApplicationsQueries } from "@/lib/query/query-invalidation";

export const createApplicationMutationOptions = (
  queryClient: QueryClient,
): UseMutationOptions => ({
  mutationFn: (data: any) => jobApplicationsApi.create(data),
  onSettled: () => invalidateJobApplicationsQueries(queryClient),
});

export const updateApplicationMutationOptions = (
  queryClient: QueryClient,
  id: string,
): UseMutationOptions => ({
  mutationFn: (data: any) => jobApplicationsApi.update(id, data),
  onSettled: () => invalidateJobApplicationsQueries(queryClient),
});

export const updateApplicationStatusMutationOptions = (
  queryClient: QueryClient,
  id: string,
  status: string,
): UseMutationOptions => ({
  mutationFn: () => jobApplicationsApi.updateStatus(id, status),
  onSettled: () => invalidateJobApplicationsQueries(queryClient),
});

export const deleteApplicationMutationOptions = (
  queryClient: QueryClient,
  id: string,
): UseMutationOptions => ({
  mutationFn: () => jobApplicationsApi.delete(id),
  onSettled: () => invalidateJobApplicationsQueries(queryClient),
});

export default {};
