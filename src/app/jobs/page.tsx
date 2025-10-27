import { createServerQueryClient } from "@/lib/query/prefetch";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { JobsManager } from "@/components/jobs/jobs-manager";
import { dehydrate } from "@tanstack/react-query";
import { JobFilters } from "@/lib/types/jobs";

export const metadata = {
  title: "Jobs | Career Platform",
  description: "Browse and manage job listings",
};

interface JobsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    locationType?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  
  const queryClient = createServerQueryClient();
  const params = await searchParams;
    const filters: JobFilters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  };
  
  if (params.search) filters.search = params.search;
  if (params.status) filters.status = params.status as any;
  if (params.locationType) filters.locationType = params.locationType as any;
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobsManager initialFilters={filters} />
    </HydrationBoundary>
  );
}