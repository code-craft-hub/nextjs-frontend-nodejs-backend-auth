import React from "react";
import { LandingPageClient } from "./LandingPageClient";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { JobFilters } from "@/lib/types/jobs";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { getDataSource } from "@/lib/utils/helpers";

const LandingPage = async () => {
  const queryClient = createServerQueryClient();
  const user = await queryClient.fetchQuery(userQueries.detail());
  const userDataSource = getDataSource(user);

  const filters: JobFilters = {
    page: 1,
    limit: 10,
    title: userDataSource?.key || userDataSource?.title || ""
  };
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPageClient filters={filters} />
    </HydrationBoundary>
  );
};

export default LandingPage;
