import { queryOptions } from "@tanstack/react-query";
import { coverLetterMetricsApi } from "../api/cover-letter-metrics.api";

export const coverLetterMetricsQueries = {
  recent: (limit = 5) =>
    queryOptions({
      queryKey: ["analytics", "cover-letters", "recent", limit] as const,
      queryFn: () => coverLetterMetricsApi.getRecent(limit),
      staleTime: 3 * 60 * 1000,
    }),
};
