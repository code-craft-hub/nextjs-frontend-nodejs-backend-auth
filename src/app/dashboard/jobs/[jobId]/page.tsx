import { HydrationBoundary } from "@/components/hydration-boundary";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { dehydrate } from "@tanstack/react-query";
import { JobIdClient } from "./JobIdClient";
const JobIdPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ referrer: string }>;
}) => {
  const { jobId } = await params;
  const { referrer } = await searchParams;
  const queryClient = createServerQueryClient();
  await queryClient.fetchQuery(jobsQueries.detail(jobId));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JobIdClient jobId={jobId} referrer={referrer} />
    </HydrationBoundary>
  );
};

export default JobIdPage;
