import React from "react";
// import { getQueryClient } from "@/lib/query-client";
// import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getUser } from "@/lib/server-fetch.utils";
import { LandingPageClient } from "./LandingPageClient";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { JobFilters } from "@/lib/types/jobs";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const LandingPage = async () => {
  const queryClient = createServerQueryClient();

  // Build filters - only include defined values
  const filters: JobFilters = {
    page: 1,
    limit: 10,
  };

  console.log("📋 Filters:", filters);
  console.log("🔑 Query key:", jobsQueries.all(filters).queryKey);

  // Prefetch
  console.log("⏳ Starting prefetch...");
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);
  console.log("✅ Prefetch complete");

  // Check cache
  const cachedData = queryClient.getQueryData(
    jobsQueries.all(filters).queryKey
  );
  console.log("🎯 Query cached:", !!cachedData);

  // Dehydrate
  const dehydratedState = dehydrate(queryClient);
  console.log("💧 Dehydrated queries:", dehydratedState.queries.length);

  // async function prefetchUserData() {
  //   const queryClient = getQueryClient();

  //   const userPromise = queryClient.prefetchQuery({
  //     queryKey: ["auth", "user"],
  //     queryFn: () => getUser(),
  //   });

  //   userPromise.catch(console.error);

  //   return queryClient;
  // }

  // const queryClient = await prefetchUserData();
  return (
    <HydrationBoundary state={dehydratedState}>
      <LandingPageClient filters={filters} />
    </HydrationBoundary>
  );
};

export default LandingPage;
