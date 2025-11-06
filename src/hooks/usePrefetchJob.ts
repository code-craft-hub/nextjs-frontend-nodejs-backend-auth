import { useQueryClient } from "@tanstack/react-query";
import { jobsQueries } from "@/lib/queries/jobs.queries";

export const usePrefetchJob = () => {
  const queryClient = useQueryClient();

  const prefetchJob = (jobId: string) => {
    queryClient.prefetchQuery(jobsQueries.detail(jobId));
  };

  const prefetchJobWithSimilar = (jobId: string) => {
    queryClient.prefetchQuery(jobsQueries.detail(jobId));
    queryClient.prefetchQuery(jobsQueries.similar(jobId));
  };

  return { prefetchJob, prefetchJobWithSimilar };
};