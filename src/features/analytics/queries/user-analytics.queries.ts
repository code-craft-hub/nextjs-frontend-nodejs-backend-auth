import { queryOptions } from "@tanstack/react-query";
import { userAnalyticsApi } from "../api/user-analytics.api";

export const userAnalyticsQueries = {
  trend: () =>
    queryOptions({
      queryKey: ["users", "analytics", "trend"] as const,
      queryFn: () => userAnalyticsApi.getTrend(),
      staleTime: 5 * 60 * 1000,
    }),
};
