import React from "react";
import { LandingPageClient } from "./LandingPageClient";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { JobFilters } from "@/lib/types/jobs";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getSessionFromCookies } from "@/lib/auth.utils";
// import { userQueries } from "@/lib/queries/user.queries";
import { userQueries } from "@/lib/queries/user.queries";

const LandingPage = async () => {
  const queryClient = createServerQueryClient();
  const email = (await getSessionFromCookies())?.email;
  if (email) {
    await queryClient.prefetchQuery(userQueries.detail());
  }
  const filters: JobFilters = {
    page: 1,
    limit: 10,
  };
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);
  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <LandingPageClient filters={filters} />
    </HydrationBoundary>
  );
};

export default LandingPage;
