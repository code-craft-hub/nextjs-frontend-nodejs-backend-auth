import { queryOptions } from "@tanstack/react-query";
import { resumeMetricsApi } from "../api/resume-metrics.api";

export const resumeMetricsQueries = {
  recent: (limit = 5) =>
    queryOptions({
      queryKey: ["analytics", "resumes", "recent", limit] as const,
      queryFn: () => resumeMetricsApi.getRecent(limit),
      staleTime: 3 * 60 * 1000,
    }),
};
