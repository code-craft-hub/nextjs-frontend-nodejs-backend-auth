import { queryOptions } from "@tanstack/react-query";
import { interviewQuestionMetricsApi } from "../api/interview-question-metrics.api";

export const interviewQuestionMetricsQueries = {
  recent: (limit = 5) =>
    queryOptions({
      queryKey: ["analytics", "interview-questions", "recent", limit] as const,
      queryFn: () => interviewQuestionMetricsApi.getRecent(limit),
      staleTime: 3 * 60 * 1000,
    }),
};
