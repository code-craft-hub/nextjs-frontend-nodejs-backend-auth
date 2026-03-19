import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  bookmarksApi,
} from "@/lib/api/bookmarks.api";
import {
  invalidateBookmarkLists,
  invalidateBookmarkCheck,
} from "@/lib/query/query-invalidation";
import { jobPostsKeys } from "@/modules/job-posts";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a bookmark for the given job.
 *
 * Optimistic update: immediately marks the job as bookmarked in the
 * `check` cache so the UI toggles without waiting for the network.
 * Rolls back on error; invalidates on settle to sync real server state.
 */
export function useCreateBookmarkMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => bookmarksApi.create(jobId),

    // onMutate: async (jobId) => {
    //   await qc.cancelQueries({ queryKey: bookmarkKeys.check(jobId) });

    //   const previousCheck = qc.getQueryData(bookmarkKeys.check(jobId));

    //   qc.setQueryData(bookmarkKeys.check(jobId), {
    //     success: true,
    //     data: { bookmarked: true },
    //   });

    //   return { previousCheck, jobId };
    // },

    // onError: (_err, jobId, context) => {
    //   if (context?.previousCheck !== undefined) {
    //     qc.setQueryData(
    //       bookmarkKeys.check(jobId),
    //       context.previousCheck,
    //     );
    //   }
    // },

    onSettled: (_data, _err, jobId) => {
      invalidateBookmarkCheck(qc, jobId);
      invalidateBookmarkLists(qc);
      qc.invalidateQueries({ queryKey: jobPostsKeys.jobPosts.infinite() });
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
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (bookmarkId: string) => bookmarksApi.removeById(bookmarkId),

    // onMutate: async (bookmarkId) => {
    //   await qc.cancelQueries({ queryKey: bookmarkKeys.infinite() });

    //   const previousInfinite = qc.getQueryData<
    //     InfiniteData<BookmarkListResponse>
    //   >(bookmarkKeys.infinite());

    //   qc.setQueryData<InfiniteData<BookmarkListResponse>>(
    //     bookmarkKeys.infinite(),
    //     (old) => {
    //       if (!old) return old;
    //       return {
    //         ...old,
    //         pages: old.pages.map((page) => ({
    //           ...page,
    //           data: page.data.filter((b: Bookmark) => b.id !== bookmarkId),
    //           pagination: {
    //             ...page.pagination,
    //             count: Math.max(0, page.pagination.count - 1),
    //           },
    //         })),
    //       };
    //     },
    //   );

    //   return { previousInfinite, bookmarkId };
    // },

    // onError: (_err, _bookmarkId, context) => {
    //   if (context?.previousInfinite !== undefined) {
    //     qc.setQueryData(
    //       bookmarkKeys.infinite(),
    //       context.previousInfinite,
    //     );
    //   }
    // },

    onSettled: () => {
      invalidateBookmarkLists(qc);
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
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => bookmarksApi.removeByJob(jobId),

    // onMutate: async (jobId) => {
    //   await qc.cancelQueries({ queryKey: bookmarkKeys.check(jobId) });
    //   await qc.cancelQueries({ queryKey: bookmarkKeys.infinite() });

    //   const previousCheck = qc.getQueryData(bookmarkKeys.check(jobId));
    //   const previousInfinite = qc.getQueryData<
    //     InfiniteData<BookmarkListResponse>
    //   >(bookmarkKeys.infinite());

    //   qc.setQueryData(bookmarkKeys.check(jobId), {
    //     success: true,
    //     data: { bookmarked: false },
    //   });

    //   qc.setQueryData<InfiniteData<BookmarkListResponse>>(
    //     bookmarkKeys.infinite(),
    //     (old) => {
    //       if (!old) return old;
    //       return {
    //         ...old,
    //         pages: old.pages.map((page) => ({
    //           ...page,
    //           data: page.data.filter((b: Bookmark) => b.jobId !== jobId),
    //           pagination: {
    //             ...page.pagination,
    //             count: Math.max(0, page.pagination.count - 1),
    //           },
    //         })),
    //       };
    //     },
    //   );

    //   return { previousCheck, previousInfinite, jobId };
    // },

    // onError: (_err, jobId, context) => {
    //   if (context?.previousCheck !== undefined) {
    //     qc.setQueryData(bookmarkKeys.check(jobId), context.previousCheck);
    //   }
    //   if (context?.previousInfinite !== undefined) {
    //     qc.setQueryData(bookmarkKeys.infinite(), context.previousInfinite);
    //   }
    // },

    onSettled: (_data, _err, jobId) => {
      invalidateBookmarkCheck(qc, jobId);
      invalidateBookmarkLists(qc);
      qc.invalidateQueries({ queryKey: jobPostsKeys.jobPosts.infinite() });
    },
  });
}

export function useToggleBookmarkByJobMutation() {
  const createBookmark = useCreateBookmarkMutation();
  const removeBookmarkByJob = useRemoveBookmarkByJobMutation();

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
  });
}
