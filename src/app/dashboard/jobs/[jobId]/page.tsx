import { HydrationBoundary } from "@/components/hydration-boundary";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { dehydrate } from "@tanstack/react-query";
import JobIdClient from "./JobIdClient";
const JobIdPage = async ({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) => {
  const { jobId } = await params;
  console.log("Job ID:", jobId);

  const queryClient = createServerQueryClient();

  const job = await queryClient.fetchQuery(jobsQueries.detail(jobId));

  console.log("Fetched Job Data on Server:", job);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
     <JobIdClient jobId={jobId} />
    </HydrationBoundary>
  );
};

export default JobIdPage;
