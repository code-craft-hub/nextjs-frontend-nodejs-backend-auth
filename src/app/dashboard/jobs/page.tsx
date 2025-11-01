import React from "react";
import { requireOnboarding } from "@/lib/server-auth";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import Overview from "./components/Overview";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { JobFilters } from "@/lib/types/jobs";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const JobListingsPage = async () => {
  await requireOnboarding();
  const queryClient = createServerQueryClient();
  const user = await queryClient.fetchQuery(userQueries.detail());
  const bookmarkedIds = (user.bookmarkedJobs || []) as string[];

  const filters: JobFilters = {
    limit: 20,
  };

  await queryClient.prefetchInfiniteQuery(jobsQueries.infinite(filters));
  await queryClient.prefetchInfiniteQuery(
    jobsQueries.bookmarked(bookmarkedIds, "", 20)
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
