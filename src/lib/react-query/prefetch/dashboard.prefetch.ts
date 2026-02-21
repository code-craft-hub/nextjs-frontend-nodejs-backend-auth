import { autoApplyQueries } from "@/lib/queries/auto-apply.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { interviewQuestionQueries } from "@/lib/queries/interview.queries";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import recommendationsQueries from "@/lib/queries/recommendations.queries";
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
  await queryClient.prefetchQuery(autoApplyQueries.all());
  await queryClient.prefetchQuery(recommendationsQueries.userRecommendations());

  // Infinite query separately (important)
  // await queryClient.prefetchInfiniteQuery(
  //   recommendationsQueries.userRecommendations()
  // );
}
