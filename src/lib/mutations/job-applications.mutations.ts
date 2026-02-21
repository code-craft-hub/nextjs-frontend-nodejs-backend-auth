import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  jobApplicationsApi,
  type ApplicationListResponse,
  type CreateApplicationData,
  type UpdateApplicationData,
} from "@/lib/api/job-applications.api";
import { jobApplicationKeys } from "@/lib/query/job-applications.keys";
import type { JobApplication } from "@/types";
import {
  invalidateApplicationLists,
  invalidateApplicationCheck,
} from "@/lib/query/query-invalidation";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Submits a new job application.
 *
 * Optimistic update: immediately marks the job as applied in the
 * `check` cache so the UI toggles without waiting for the network.
 * Rolls back on error; invalidates on settle to sync real server state.
 */
export function useCreateApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationData) =>
      jobApplicationsApi.create(data),

    onMutate: async ({ jobId }) => {
      await queryClient.cancelQueries({
        queryKey: jobApplicationKeys.check(jobId),
      });

      const previousCheck = queryClient.getQueryData(
        jobApplicationKeys.check(jobId),
      );

      queryClient.setQueryData(jobApplicationKeys.check(jobId), {
        success: true,
        data: { applied: true },
      });

      return { previousCheck, jobId };
    },

    onError: (_err, { jobId }, context) => {
      if (context?.previousCheck !== undefined) {
        queryClient.setQueryData(
          jobApplicationKeys.check(jobId),
          context.previousCheck,
        );
      }
    },

    onSettled: (_data, _err, { jobId }) => {
      invalidateApplicationCheck(queryClient, jobId);
      invalidateApplicationLists(queryClient);
    },
  });
}

// ─── Update Status ────────────────────────────────────────────────────────────

/**
 * Updates the status of an existing application.
 *
 * Optimistic update: reflects the new status in the infinite-scroll
 * cache immediately. Rolls back on error.
 */
export function useUpdateApplicationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: string;
    }) => jobApplicationsApi.updateStatus(applicationId, status),

    onMutate: async ({ applicationId, status }) => {
      await queryClient.cancelQueries({
        queryKey: jobApplicationKeys.infinite(),
      });
      await queryClient.cancelQueries({
        queryKey: jobApplicationKeys.detail(applicationId),
      });

      const previousInfinite =
        queryClient.getQueryData<InfiniteData<ApplicationListResponse>>(
          jobApplicationKeys.infinite(),
        );
      const previousDetail = queryClient.getQueryData(
        jobApplicationKeys.detail(applicationId),
      );

      queryClient.setQueryData<InfiniteData<ApplicationListResponse>>(
        jobApplicationKeys.infinite(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((app: JobApplication) =>
                app.id === applicationId
                  ? { ...app, status, statusUpdatedAt: new Date().toISOString() }
                  : app,
              ),
            })),
          };
        },
      );

      return { previousInfinite, previousDetail, applicationId };
    },

    onError: (_err, { applicationId }, context) => {
      if (context?.previousInfinite !== undefined) {
        queryClient.setQueryData(
          jobApplicationKeys.infinite(),
          context.previousInfinite,
        );
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(
          jobApplicationKeys.detail(applicationId),
          context.previousDetail,
        );
      }
    },

    onSettled: (_data, _err, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.detail(applicationId),
      });
      invalidateApplicationLists(queryClient);
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Updates application details (notes, followUpDate, resumeId, etc.).
 *
 * Optimistic update: merges changes into the infinite-scroll cache.
 * Rolls back on error.
 */
export function useUpdateApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string;
      data: UpdateApplicationData;
    }) => jobApplicationsApi.update(applicationId, data),

    onMutate: async ({ applicationId, data }) => {
      await queryClient.cancelQueries({
        queryKey: jobApplicationKeys.infinite(),
      });
      await queryClient.cancelQueries({
        queryKey: jobApplicationKeys.detail(applicationId),
      });

      const previousInfinite =
        queryClient.getQueryData<InfiniteData<ApplicationListResponse>>(
          jobApplicationKeys.infinite(),
        );
      const previousDetail = queryClient.getQueryData(
        jobApplicationKeys.detail(applicationId),
      );

      queryClient.setQueryData<InfiniteData<ApplicationListResponse>>(
        jobApplicationKeys.infinite(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((app: JobApplication) =>
                app.id === applicationId
                  ? { ...app, ...data, updatedAt: new Date().toISOString() }
                  : app,
              ),
            })),
          };
        },
      );

      return { previousInfinite, previousDetail, applicationId };
    },

    onError: (_err, { applicationId }, context) => {
      if (context?.previousInfinite !== undefined) {
        queryClient.setQueryData(
          jobApplicationKeys.infinite(),
          context.previousInfinite,
        );
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(
          jobApplicationKeys.detail(applicationId),
          context.previousDetail,
        );
      }
    },

    onSettled: (_data, _err, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: jobApplicationKeys.detail(applicationId),
      });
      invalidateApplicationLists(queryClient);
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Soft-deletes an application.
 *
 * Optimistic update: removes the entry from the infinite-scroll cache
 * immediately and flips the `check` cache to not applied.
 * Rolls back on error.
 */
export function useDeleteApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationId,
    }: {
      applicationId: string;
      jobId?: string;
    }) => jobApplicationsApi.delete(applicationId),

    onMutate: async ({ applicationId, jobId }) => {
      await queryClient.cancelQueries({
        queryKey: jobApplicationKeys.infinite(),
      });

      const previousInfinite =
        queryClient.getQueryData<InfiniteData<ApplicationListResponse>>(
          jobApplicationKeys.infinite(),
        );
      const previousCheck = jobId
        ? queryClient.getQueryData(jobApplicationKeys.check(jobId))
        : undefined;

      queryClient.setQueryData<InfiniteData<ApplicationListResponse>>(
        jobApplicationKeys.infinite(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter(
                (app: JobApplication) => app.id !== applicationId,
              ),
              pagination: {
                ...page.pagination,
                count: Math.max(0, page.pagination.count - 1),
              },
            })),
          };
        },
      );

      if (jobId) {
        queryClient.setQueryData(jobApplicationKeys.check(jobId), {
          success: true,
          data: { applied: false },
        });
      }

      return { previousInfinite, previousCheck, applicationId, jobId };
    },

    onError: (_err, { applicationId, jobId }, context) => {
      if (context?.previousInfinite !== undefined) {
        queryClient.setQueryData(
          jobApplicationKeys.infinite(),
          context.previousInfinite,
        );
      }
      if (jobId && context?.previousCheck !== undefined) {
        queryClient.setQueryData(
          jobApplicationKeys.check(jobId),
          context.previousCheck,
        );
      }
    },

    onSettled: (_data, _err, { applicationId, jobId }) => {
      queryClient.removeQueries({
        queryKey: jobApplicationKeys.detail(applicationId),
      });
      if (jobId) invalidateApplicationCheck(queryClient, jobId);
      invalidateApplicationLists(queryClient);
    },
  });
}
