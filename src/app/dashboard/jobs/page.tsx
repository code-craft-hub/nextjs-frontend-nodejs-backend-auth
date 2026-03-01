import { dehydrate } from "@tanstack/react-query";
import Overview from "../../../modules/job-posts/components/Overview";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { getCookiesToken } from "@/lib/auth.utils";
import { jobPostsQueries } from "@/modules/job-posts";

const JobListingsPage = async () => {
  const token = (await getCookiesToken()) ?? "";

  const queryClient = createServerQueryClient();
  await queryClient.prefetchInfiniteQuery(
    jobPostsQueries.infinite(undefined, token),
  );

  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Overview />
      </HydrationBoundary>
    </div>
  );
};

export default JobListingsPage;
