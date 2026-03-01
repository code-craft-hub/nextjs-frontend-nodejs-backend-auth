import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api/jobs.api";
import { queryKeys } from "@/lib/query/keys";
import type { PaginatedResponse } from "@/lib/types";

export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => jobsApi.createJob(data),
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.lists() });

      const previousJobs = queryClient.getQueryData(queryKeys.jobs.lists());

      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.jobs.lists() },
        (old) => {
          if (!old) return old;
          const tempJob: any = {
            id: "temp-" + Date.now(),
            userId: "temp",
            ...newJob,
            status: newJob.status || "draft",
            tags: newJob.tags || [],
            postedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...old,
            data: [tempJob, ...old.data],
            total: old.total + 1,
          };
        }
      );

      return { previousJobs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousJobs) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.jobs.lists() },
          context.previousJobs
        );
      }
    },
    onSuccess: () => {
      // Invalidate stats after creating
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.stats() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.filters() });
    },
  });
}

export function useUpdateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobsApi.updateJob(id, data),

    /**
     * Optimistic update strategy for the bookmark toggle (and any other
     * single-field patch on a job):
     *
     * 1. Immediately flip `isBookmarked` (or the patched field) in every
     *    job-posts infinite-query page so the UI reacts without a round-trip.
     * 2. On error, restore the snapshot.
     * 3. On settle, invalidate the user query so the bookmarkedJobs count
     *    in ReportCard / SavedJobs stays accurate.
     */
    onMutate: async ({ id, data }) => {
      // Cancel any in-flight fetches for the job-posts list so they don't
      // overwrite our optimistic update.
      await queryClient.cancelQueries({
        queryKey: [...queryKeys.jobs.lists(), "infinite"],
      });

      // Snapshot all infinite pages before mutation
      const previousPages = queryClient.getQueriesData({
        queryKey: [...queryKeys.jobs.lists(), "infinite"],
      });

      // Optimistically patch the matching job in every cached page
      queryClient.setQueriesData(
        { queryKey: [...queryKeys.jobs.lists(), "infinite"] },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: page.data?.map((job: any) =>
                job.id === id
                  ? { ...job, ...data, updatedAt: new Date().toISOString() }
                  : job,
              ),
            })),
          };
        },
      );

      return { previousPages };
    },

    onError: (_err, _variables, context) => {
      // Roll back to the snapshot on failure
      if (context?.previousPages) {
        context.previousPages.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      // Keep the user object (bookmarkedJobs count) in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
export function useUpdateJobApplicationHistoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jobsApi.updateJobApplicationHistory(id, data),
    onSettled: () => {
      // Invalidate user so appliedJobs count stays accurate in ReportCard
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsApi.deleteJob(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.lists() });

      const previousJobs = queryClient.getQueryData(queryKeys.jobs.lists());

      // Remove from all list queries
      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.jobs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((job) => job.id !== id),
            total: old.total - 1,
          };
        }
      );

      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.jobs.detail(id) });

      return { previousJobs };
    },
    onError: (_err, _id, context) => {
      if (context?.previousJobs) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.jobs.lists() },
          context.previousJobs
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.stats() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.filters() });
    },
  });
}

// Bulk operations (FAANG standard)
export function useBulkUpdateJobsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: any }) =>
      jobsApi.bulkUpdateJobs(ids, data),
    onMutate: async ({ ids, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.lists() });

      const previousJobs = queryClient.getQueryData(queryKeys.jobs.lists());

      // Optimistically update all affected jobs
      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.jobs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((job) =>
              ids.includes(job.id)
                ? { ...job, ...data, updatedAt: new Date().toISOString() }
                : job
            ),
          };
        }
      );

      return { previousJobs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousJobs) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.jobs.lists() },
          context.previousJobs
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useBulkDeleteJobsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => jobsApi.bulkDeleteJobs(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.lists() });

      const previousJobs = queryClient.getQueryData(queryKeys.jobs.lists());

      // Remove all selected jobs
      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.jobs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((job) => !ids.includes(job.id)),
            total: old.total - ids.length,
          };
        }
      );

      return { previousJobs };
    },
    onError: (_err, _ids, context) => {
      if (context?.previousJobs) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.jobs.lists() },
          context.previousJobs
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
}

export function useBulkChangeStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: any["status"] }) =>
      jobsApi.bulkChangeStatus(ids, status),
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jobs.lists() });

      const previousJobs = queryClient.getQueryData(queryKeys.jobs.lists());

      queryClient.setQueriesData<PaginatedResponse<any>>(
        { queryKey: queryKeys.jobs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((job) =>
              ids.includes(job.id)
                ? { ...job, status, updatedAt: new Date().toISOString() }
                : job
            ),
          };
        }
      );

      return { previousJobs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousJobs) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.jobs.lists() },
          context.previousJobs
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.stats() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
}

export function useDuplicateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsApi.duplicateJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.stats() });
    },
  });
}
