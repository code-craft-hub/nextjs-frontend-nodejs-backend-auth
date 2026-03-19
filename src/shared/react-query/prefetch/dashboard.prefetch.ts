import jobApplicationQueries from "@/features/analytics/queries/application-history.queries";
import { autoApplyQueries } from "@/features/auto-apply/queries/auto-apply.queries";
import { bookmarksQueries } from "@/features/bookmarks/queries/bookmarks.queries";
import { coverLetterQueries } from "@/features/cover-letter/queries/cover-letter.queries";
import { interviewQuestionQueries } from "@/features/interview/queries/interview.queries";
import recommendationsQueries from "@/features/recommendations/queries/recommendations.queries";
import { resumeQueries } from "@/features/resume/queries/resume.queries";
import { JobFilters } from "@/shared/types/jobs.types";
import { jobPostsQueries } from "@/modules/job-posts";
import { QueryClient } from "@tanstack/react-query";

type DashboardPrefetchParams = {
  filters: JobFilters;
};

export async function prefetchDashboardData(
  queryClient: QueryClient,
  { filters }: DashboardPrefetchParams,
) {
  try {
    // Regular queries
    await queryClient.prefetchQuery(resumeQueries.all(filters));
    await queryClient.prefetchQuery(interviewQuestionQueries.all(filters));
    await queryClient.prefetchQuery(coverLetterQueries.all(filters));
    await queryClient.prefetchQuery(autoApplyQueries.all());

    // Infinite queries (these may have pagination under the hood)
    await queryClient.prefetchInfiniteQuery({
      ...recommendationsQueries.userRecommendations(),
      initialPageParam: 1,
    });

    await queryClient.prefetchInfiniteQuery(jobPostsQueries.infinite());

    await queryClient.prefetchInfiniteQuery(bookmarksQueries.infiniteList());
    await queryClient.prefetchInfiniteQuery(
      jobApplicationQueries.infiniteList(),
    );
  } catch (error) {
    console.error("Error prefetching dashboard data:", error);
  }
}
