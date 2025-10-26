// lib/mutations/jobs.mutations.ts
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

      // Optimistically add to all matching list queries
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
    // onMutate: async ({ id, data }) => {
    //   await queryClient.cancelQueries({ queryKey: queryKeys.jobs.detail(id) });

    //   const previousJob = queryClient.getQueryData(queryKeys.jobs.detail(id));

    //   // Update detail view
    //   queryClient.setQueryData<any>(queryKeys.jobs.detail(id), (old: any) => {
    //     if (!old) return old;
    //     return { ...old, ...data, updatedAt: new Date().toISOString() };
    //   });

    //   // Update in all list queries
    //   queryClient.setQueriesData<PaginatedResponse<any>>(
    //     { queryKey: queryKeys.jobs.lists() },
    //     (old) => {
    //       if (!old) return old;
    //       return {
    //         ...old,
    //         data: old.data.map((job) =>
    //           job.id === id
    //             ? { ...job, ...data, updatedAt: new Date().toISOString() }
    //             : job
    //         ),
    //       };
    //     }
    //   );

    //   return { previousJob };
    // },
    // onError: (_err, { id }, context) => {
    //   if (context?.previousJob) {
    //     queryClient.setQueryData(
    //       queryKeys.jobs.detail(id),
    //       context.previousJob
    //     );
    //   }
    // },
    onSuccess: (_updatedJob) => {
      // Update stats if status changed
      // queryClient.invalidateQueries({ queryKey: queryKeys.jobs.stats() });
      
      // Invalidate similar jobs if tags or other metadata changed
      // queryClient.invalidateQueries({
        //   queryKey: [...queryKeys.jobs.all, "similar"],
        // });
      },
      onSettled: (_data, _error, 
        // { id }
      ) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      // queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) });
      // queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
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
