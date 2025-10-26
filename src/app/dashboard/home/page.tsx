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
   await queryClient.fetchQuery(userQueries.detail());
  // const defaultJobRole = user?.dataSource?.find(
  //   (ds) => ds.ProfileID === user?.defaultactiveDataSource
  // );
  // const roles =
  //   defaultJobRole?.roleOfInterest?.map((role: any) => role.value).join(", ") ||
  //   "None";

  const { tab, jobDescription } = await searchParams;

  const filters: JobFilters = {
    page: 1,
    limit: 20,
    // jobRole: encodeURIComponent(roles),
  };

  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);

  await queryClient.prefetchInfiniteQuery(jobsQueries.infinite(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient tab={tab} jobDescription={jobDescription} filters={filters} />
    </HydrationBoundary>
  );
}
