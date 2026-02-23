import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  bookmarksApi,
  type Bookmark,
  type BookmarkListResponse,
} from "@/lib/api/bookmarks.api";
import { bookmarkKeys } from "@/lib/query/bookmarks.keys";
import {
  invalidateBookmarkLists,
  invalidateBookmarkCheck,
} from "@/lib/query/query-invalidation";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a bookmark for the given job.
 *
 * Optimistic update: immediately marks the job as bookmarked in the
 * `check` cache so the UI toggles without waiting for the network.
 * Rolls back on error; invalidates on settle to sync real server state.
 */
export function useCreateBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => bookmarksApi.create(jobId),

    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.check(jobId) });

      const previousCheck = queryClient.getQueryData(bookmarkKeys.check(jobId));

      queryClient.setQueryData(bookmarkKeys.check(jobId), {
        success: true,
        data: { bookmarked: true },
      });

      return { previousCheck, jobId };
    },

    onError: (_err, jobId, context) => {
      if (context?.previousCheck !== undefined) {
        queryClient.setQueryData(
          bookmarkKeys.check(jobId),
          context.previousCheck,
        );
      }
    },

    onSettled: (_data, _err, jobId) => {
      invalidateBookmarkCheck(queryClient, jobId);
      invalidateBookmarkLists(queryClient);
    },
  });
}

// ─── Remove by Bookmark ID ────────────────────────────────────────────────────

/**
 * Removes a bookmark by its ID.
 *
 * Optimistic update: removes the entry from the infinite-scroll cache
 * immediately. Rolls back on error.
 */
export function useRemoveBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkId: string) => bookmarksApi.removeById(bookmarkId),

    onMutate: async (bookmarkId) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.infinite() });

      const previousInfinite = queryClient.getQueryData<
        InfiniteData<BookmarkListResponse>
      >(bookmarkKeys.infinite());

      queryClient.setQueryData<InfiniteData<BookmarkListResponse>>(
        bookmarkKeys.infinite(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((b: Bookmark) => b.id !== bookmarkId),
              pagination: {
                ...page.pagination,
                count: Math.max(0, page.pagination.count - 1),
              },
            })),
          };
        },
      );

      return { previousInfinite, bookmarkId };
    },

    onError: (_err, _bookmarkId, context) => {
      if (context?.previousInfinite !== undefined) {
        queryClient.setQueryData(
          bookmarkKeys.infinite(),
          context.previousInfinite,
        );
      }
    },

    onSettled: () => {
      invalidateBookmarkLists(queryClient);
    },
  });
}

// ─── Remove by Job ID ─────────────────────────────────────────────────────────

/**
 * Removes the authenticated user's bookmark for a specific job.
 *
 * Optimistic updates:
 *  1. Marks the `check` cache as not bookmarked.
 *  2. Removes the matching entry from the infinite-scroll cache.
 * Both roll back on error.
 */
export function useRemoveBookmarkByJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => bookmarksApi.removeByJob(jobId),

    onMutate: async (jobId) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.check(jobId) });
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.infinite() });

      const previousCheck = queryClient.getQueryData(bookmarkKeys.check(jobId));
      const previousInfinite = queryClient.getQueryData<
        InfiniteData<BookmarkListResponse>
      >(bookmarkKeys.infinite());

      queryClient.setQueryData(bookmarkKeys.check(jobId), {
        success: true,
        data: { bookmarked: false },
      });

      queryClient.setQueryData<InfiniteData<BookmarkListResponse>>(
        bookmarkKeys.infinite(),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((b: Bookmark) => b.jobId !== jobId),
              pagination: {
                ...page.pagination,
                count: Math.max(0, page.pagination.count - 1),
              },
            })),
          };
        },
      );

      return { previousCheck, previousInfinite, jobId };
    },

    onError: (_err, jobId, context) => {
      if (context?.previousCheck !== undefined) {
        queryClient.setQueryData(
          bookmarkKeys.check(jobId),
          context.previousCheck,
        );
      }
      if (context?.previousInfinite !== undefined) {
        queryClient.setQueryData(
          bookmarkKeys.infinite(),
          context.previousInfinite,
        );
      }
    },

    onSettled: (_data, _err, jobId) => {
      invalidateBookmarkCheck(queryClient, jobId);
      invalidateBookmarkLists(queryClient);
    },
  });
}

export function useToggleBookmarkByJobMutation() {
  const createBookmark = useCreateBookmarkMutation();
  const removeBookmarkByJob = useRemoveBookmarkByJobMutation();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      jobId,
      isBookmarked,
    }: {
      jobId: string;
      isBookmarked: boolean;
    }) => {
      if (isBookmarked) {
        await removeBookmarkByJob.mutateAsync(jobId);
      } else {
        await createBookmark.mutateAsync(jobId);
      }
    },

    // Optimistically flip isBookmarked in every cached jobs page so the
    // Toggle in JobRow reacts instantly without waiting for a refetch.
    onMutate: async ({ jobId, isBookmarked }) => {
      await qc.cancelQueries({ queryKey: ["jobs"] });

      const previousJobs = qc.getQueriesData({ queryKey: ["jobs"] });

      qc.setQueriesData({ queryKey: ["jobs"] }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items?.map((job: any) =>
              job.id === jobId
                ? { ...job, isBookmarked: !isBookmarked }
                : job,
            ),
          })),
        };
      });

      return { previousJobs };
    },

    onError: (_err, _variables, context) => {
      context?.previousJobs?.forEach(([queryKey, data]: any) => {
        qc.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}
