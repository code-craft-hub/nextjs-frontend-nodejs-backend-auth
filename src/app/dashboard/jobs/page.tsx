// import { createServerQueryClient } from "@/lib/query/prefetch";
// import { userQueries } from "@/lib/queries/user.queries";
// import Overview from "./components/Overview";
// import { jobsQueries } from "@/lib/queries/jobs.queries";
// import { JobFilters } from "@/lib/types/jobs";
// import { HydrationBoundary } from "@/components/hydration-boundary";
// import { dehydrate } from "@tanstack/react-query";
// import { getCookiesToken } from "@/lib/auth.utils";

const JobListingsPage = async () => {
  // const token = (await getCookiesToken()) ?? "";
  // const queryClient = createServerQueryClient();
  // const user = await queryClient.fetchQuery(userQueries.detail(token));
  // const bookmarkedIds = (user.bookmarkedJobs || []) as string[];

  // const filters: JobFilters = {
  //   limit: 20,
  // };

  // await queryClient.prefetchInfiniteQuery(jobsQueries.infinite(filters, token));
  // await queryClient.prefetchInfiniteQuery(
  //   jobsQueries.bookmarked(bookmarkedIds, "", 20, token)
  // );
  return (
    <div className="p-4 sm:p-8">
      JOb
      {/* <HydrationBoundary state={dehydrate(queryClient)}>
        <Overview />
      </HydrationBoundary> */}
    </div>
  );
};

export default JobListingsPage;
