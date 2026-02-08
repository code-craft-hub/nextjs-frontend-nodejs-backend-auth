import { aiApplyQueries } from "@/lib/queries/ai-apply.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { interviewQuestionQueries } from "@/lib/queries/interview.queries";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { JobFilters } from "@/lib/types/jobs";
import { QueryClient } from "@tanstack/react-query";


type DashboardPrefetchParams = {
  filters: JobFilters;
  autoApplyFilters: JobFilters;
};

export async function prefetchDashboardData(
  queryClient: QueryClient,
  { filters }: DashboardPrefetchParams
) {
  await queryClient.prefetchQuery(jobsQueries.all(filters));
  await queryClient.prefetchQuery(jobsQueries.autoApply());
  await queryClient.prefetchQuery(resumeQueries.all(filters));
  await queryClient.prefetchQuery(interviewQuestionQueries.all(filters));
  await queryClient.prefetchQuery(coverLetterQueries.all(filters));
  await queryClient.prefetchQuery(aiApplyQueries.all(filters));

  // Infinite query separately (important)
  await queryClient.prefetchInfiniteQuery(
    jobsQueries.infinite(filters)
  );
}
