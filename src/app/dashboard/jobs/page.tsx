import React from "react";
import { requireOnboarding } from "@/lib/server-auth";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import Overview from "./components/Overview";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { JobFilters } from "@/lib/types/jobs";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const JobListingsPage = async () => {
  await requireOnboarding();
  const queryClient = createServerQueryClient();
  await queryClient.fetchQuery(userQueries.detail());

  const filters: JobFilters = {
    page: 1,
    limit: 20,
  };

  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);

  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Overview />
      </HydrationBoundary>
    </div>
  );
};

export default JobListingsPage;
