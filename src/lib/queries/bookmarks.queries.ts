import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { bookmarksApi } from "@/lib/api/bookmarks.api";
import { bookmarkKeys } from "@/lib/query/bookmarks.keys";

export const bookmarksQueries = {
  /**
   * Single page — useful for admin views or non-scrolling lists.
   */
  list: (page = 1, limit = 20) =>
    queryOptions({
      queryKey: bookmarkKeys.list({ page, limit }),
      queryFn: () => bookmarksApi.list(page, limit),
      staleTime: 2 * 60 * 1000,
    }),

  /**
   * Infinite scroll — drives the Saved Jobs feed.
   *
   * The backend does not expose a total count, so we use the heuristic:
   *   count < limit  →  we're on the last page
   *   count === limit →  there may be more pages
   */
  infiniteList: (limit = 20) =>
    infiniteQueryOptions({
      queryKey: bookmarkKeys.infinite(),
      queryFn: ({ pageParam }) => bookmarksApi.list(pageParam, limit),
      getNextPageParam: (lastPage) => {
        const { page, count } = lastPage.pagination;
        return count === limit ? page + 1 : undefined;
      },
      getPreviousPageParam: (firstPage) => {
        const { page } = firstPage.pagination;
        return page > 1 ? page - 1 : undefined;
      },
      initialPageParam: 1,
      staleTime: 2 * 60 * 1000,
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
