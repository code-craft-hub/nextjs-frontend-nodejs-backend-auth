import {
  infiniteQueryOptions,
  queryOptions,
} from "@tanstack/react-query";
import { presenceApi } from "../api/presence.api";
import { queryKeys } from "@/lib/query/keys";

/** Stale/refetch interval shared by all presence queries (30 s). */
const PRESENCE_INTERVAL_MS = 30_000;

export const presenceQueries = {
  /**
   * Active-user aggregate stats (count + window duration).
   * Auto-refetches every 30 s so the admin summary card stays current.
   */
  stats: (token?: string) =>
    queryOptions({
      queryKey: queryKeys.presence.stats(),
      queryFn: () => presenceApi.getStats(token),
      staleTime: PRESENCE_INTERVAL_MS,
      refetchInterval: PRESENCE_INTERVAL_MS,
    }),

  /**
   * Infinite list of currently active users, cursor-paginated by lastSeenAt DESC.
   * Each page refetches automatically every 30 s so the list stays live.
   */
  activeUsersInfinite: (token?: string) =>
    infiniteQueryOptions({
      queryKey: queryKeys.presence.activeUsersInfinite(),
      queryFn: ({ pageParam }) =>
        presenceApi.getActiveUsers({ cursor: pageParam, token }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: PRESENCE_INTERVAL_MS,
      refetchInterval: PRESENCE_INTERVAL_MS,
    }),
};
