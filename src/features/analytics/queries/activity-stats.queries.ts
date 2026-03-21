import { queryOptions } from "@tanstack/react-query";
import { activityStatsApi } from "../api/activity-stats.api";

export const activityStatsQueries = {
  stats: (daysBack = 30) =>
    queryOptions({
      queryKey: ["analytics", "activity", "stats", daysBack] as const,
      queryFn: () => activityStatsApi.getStats(daysBack),
      staleTime: 2 * 60 * 1000,
    }),
  recent: (limit = 10) =>
    queryOptions({
      queryKey: ["analytics", "activity", "recent", limit] as const,
      queryFn: () => activityStatsApi.getRecent(limit),
      staleTime: 2 * 60 * 1000,
    }),
};
