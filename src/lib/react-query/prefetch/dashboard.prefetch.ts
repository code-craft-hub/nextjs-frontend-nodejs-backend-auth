import jobApplicationQueries from "@/lib/queries/application-history.queries";
import { autoApplyQueries } from "@/lib/queries/auto-apply.queries";
import { bookmarksQueries } from "@/lib/queries/bookmarks.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { interviewQuestionQueries } from "@/lib/queries/interview.queries";
import { jobPostsQueries } from "@/lib/queries/job-posts.queries";
import recommendationsQueries from "@/lib/queries/recommendations.queries";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { JobFilters } from "@/lib/types/jobs";
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
    await queryClient.prefetchInfiniteQuery(jobPostsQueries.infinite(filters));
    await queryClient.prefetchInfiniteQuery(bookmarksQueries.infiniteList());
    await queryClient.prefetchInfiniteQuery(
      jobApplicationQueries.infiniteList(),
    );
  } catch (error) {
    console.error("Error prefetching dashboard data:", error);
  }
}
