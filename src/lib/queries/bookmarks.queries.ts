import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { bookmarksApi } from "@/lib/api/bookmarks.api";
import { bookmarkKeys } from "@/lib/query/bookmarks.keys";

export const bookmarksQueries = {
  /**
   * First page only — for non-scrolling overview lists.
   */
  list: (limit = 20) =>
    queryOptions({
      queryKey: bookmarkKeys.list({ limit }),
      queryFn: () => bookmarksApi.list(undefined, limit),
      staleTime: 2 * 60 * 1000,
    }),

  /**
   * Infinite scroll — drives the Saved Jobs feed.
   *
   * Uses cursor-based pagination: `nextCursor` from the last page is passed as
   * `cursor` to fetch the next batch. `null` means no more pages.
   *
   * Returned via `infiniteQueryOptions` so it can be passed directly to
   * both `useInfiniteQuery` and `queryClient.prefetchInfiniteQuery`.
   */
  infiniteList: (limit = 20) =>
    infiniteQueryOptions({
      queryKey: bookmarkKeys.infinite(),
      queryFn: ({ pageParam }) =>
        bookmarksApi.list(pageParam ?? undefined, limit),
      getNextPageParam: (lastPage) =>
        lastPage.pagination.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
      staleTime: 10 * 60 * 1000,
    }),

  /**
   * Single bookmark detail — used when navigating to a specific bookmark.
   */
  detail: (bookmarkId: string) =>
    queryOptions({
      queryKey: bookmarkKeys.detail(bookmarkId),
      queryFn: () => bookmarksApi.getById(bookmarkId),
      staleTime: 5 * 60 * 1000,
      enabled: !!bookmarkId,
    }),

  /**
   * Bookmark existence check — drives the bookmark toggle button state.
   * Stays fresh for 2 min; mutations update it optimistically.
   */
  check: (jobId: string) =>
    queryOptions({
      queryKey: bookmarkKeys.check(jobId),
      queryFn: () => bookmarksApi.check(jobId),
      staleTime: 2 * 60 * 1000,
      enabled: !!jobId,
    }),
};
