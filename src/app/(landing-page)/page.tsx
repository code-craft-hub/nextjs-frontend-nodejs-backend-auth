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
import { userServerQueries } from "@/lib/queries/user.server.queries";

const LandingPage = async () => {
  const queryClient = createServerQueryClient();
  const email = (await getSessionFromCookies())?.email;

  // if(email) await queryClient.prefetchQuery(userQueries.detail());

  if (email) {
    await queryClient.prefetchQuery(userServerQueries.detail(email));
  }

  // const cached = queryClient.getQueryData(
  //   userServerQueries.detail(email!).queryKey
  // );

  // console.log("👤 User cached in server fetch:", cached);
  const filters: JobFilters = {
    page: 1,
    limit: 10,
  };

  // console.log("📋 Filters:", filters);
  // console.log("🔑 Query key:", jobsQueries.all(filters).queryKey);

  // Prefetch
  // console.log("⏳ Starting prefetch...");
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);
  // Check cache
  // const cachedData = queryClient.getQueryData(
  //   jobsQueries.all(filters).queryKey
  // );
  // console.log("🎯 Query cached:", !!cachedData);

  // Dehydrate
  const dehydratedState = dehydrate(queryClient);
  // console.log("💧 Dehydrated queries:", dehydratedState.queries.length);
  return (
    <HydrationBoundary state={dehydratedState}>
      <LandingPageClient filters={filters} />
    </HydrationBoundary>
  );
};

export default LandingPage;
