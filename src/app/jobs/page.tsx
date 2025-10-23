// app/jobs/page.tsx - Server component with parallel prefetching
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

// app/jobs/page.tsx
export default async function JobsPage({ searchParams }: JobsPageProps) {
  console.log('🚀 SERVER COMPONENT START');
  
  const queryClient = createServerQueryClient();
  const params = await searchParams;
  
  // Build filters - only include defined values
  const filters: JobFilters = {
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  };
  
  // Only add optional filters if they exist
  if (params.search) filters.search = params.search;
  if (params.status) filters.status = params.status as any;
  if (params.locationType) filters.locationType = params.locationType as any;

  console.log('📋 Filters:', filters);
  console.log('🔑 Query key:', jobsQueries.all(filters).queryKey);

  // Prefetch
  console.log('⏳ Starting prefetch...');
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);
  console.log('✅ Prefetch complete');

  // Check cache
  const cachedData = queryClient.getQueryData(jobsQueries.all(filters).queryKey);
  console.log('🎯 Query cached:', !!cachedData);

  // Dehydrate
  const dehydratedState = dehydrate(queryClient);
  console.log('💧 Dehydrated queries:', dehydratedState.queries.length);

  return (
    <HydrationBoundary state={dehydratedState}>
      <JobsManager initialFilters={filters} />
    </HydrationBoundary>
  );
}

// export default async function JobsPage({ searchParams }: JobsPageProps) {
//   const queryClient = createServerQueryClient();
//   const params = await searchParams;
//   const rawFilters = {
//     page: params.page ? parseInt(params.page) : 1,
//     search: params.search,
//     status: params.status as any,
//     locationType: params.locationType as any,
//     limit: 20,
//   };

//   // Normalize before prefetching
//   const filters = normalizeJobFilters(rawFilters);
//   // Prefetch with priorities - FAANG standard
//   await prefetchWithPriority(queryClient, [
//     {
//       queryKey: jobsQueries.all(filters).queryKey,
//       queryFn: jobsQueries.all(filters).queryFn,
//       priority: "high", // Jobs list is critical
//     },
//   ]);

//   console.log(
//     "JOB FILTERS ON SERVER COMPONENT : ",
//     filters,
//     jobsQueries.all(filters).queryKey
//   );

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <JobsManager initialFilters={filters} />
//     </HydrationBoundary>
//   );
// }

// export const revalidate = 360;

// {
//   queryKey: jobsQueries.filters().queryKey,
//   queryFn: jobsQueries.filters().queryFn,
//   priority: "high", // Need filters for UI
// },
// {
//   queryKey: jobsQueries.stats().queryKey,
//   queryFn: jobsQueries.stats().queryFn,
//   priority: "medium", // Stats for analytics
// },
