import { requireOnboarding } from "@/lib/server-auth";
import type { Metadata } from "next";
import { DashboardTab } from "@/types/index.js";
import { HomeClient } from "./Home.tsx";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { dehydrate } from "@tanstack/react-query";
import { JobFilters } from "@/lib/types/jobs";
import { userQueries } from "@/lib/queries/user.queries";
export const metadata: Metadata = {
  title: "Cverai Dashboard",
  description: "User dashboard",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab: DashboardTab; jobDescription: string }>;
}) {
  await requireOnboarding();
  const queryClient = createServerQueryClient();

  const { data } = await queryClient.fetchQuery(userQueries.detail());

  const { tab, jobDescription } = await searchParams;

  const filters: JobFilters = {
    page: 1,
    limit: 20,
    jobRole: data?.role!,
  };

  // console.log("📋 Filters:", filters);
  // console.log("🔑 Query key:", jobsQueries.all(filters).queryKey);

  // // Prefetch
  // console.log("⏳ Starting prefetch...");
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);
  // console.log("✅ Prefetch complete");

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
      <HomeClient tab={tab} jobDescription={jobDescription} filters={filters} />
      ;
    </HydrationBoundary>
  );
}
