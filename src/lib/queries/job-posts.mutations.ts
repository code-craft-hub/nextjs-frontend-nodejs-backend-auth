import { QueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { jobPostsApi } from "@/modules/job-posts";
import { invalidateJobPostsQueries } from "@/lib/query/query-invalidation";

export const createJobPostMutationOptions = (
  queryClient: QueryClient,
): UseMutationOptions => ({
  mutationFn: (data: any) => jobPostsApi.create(data),
  onSettled: () => invalidateJobPostsQueries(queryClient),
});

export const createManyJobPostsMutationOptions = (
  queryClient: QueryClient,
): UseMutationOptions => ({
  // @ts-ignore
  mutationFn: (items: any[]) => jobPostsApi.createMany(items),
  onSettled: () => invalidateJobPostsQueries(queryClient),
});

export const updateJobPostMutationOptions = (
  queryClient: QueryClient,
  id: string,
): UseMutationOptions => ({
  mutationFn: (data: any) => jobPostsApi.update(id, data),
  onSettled: () => invalidateJobPostsQueries(queryClient),
});

export const markAsProcessedMutationOptions = (
  queryClient: QueryClient,
  id: string,
): UseMutationOptions => ({
  mutationFn: () => jobPostsApi.markAsProcessed(id),
  onSettled: () => invalidateJobPostsQueries(queryClient),
});

export const deleteJobPostMutationOptions = (
  queryClient: QueryClient,
  id: string,
): UseMutationOptions => ({
  mutationFn: () => jobPostsApi.delete(id),
  onSettled: () => invalidateJobPostsQueries(queryClient),
});

export default {};
