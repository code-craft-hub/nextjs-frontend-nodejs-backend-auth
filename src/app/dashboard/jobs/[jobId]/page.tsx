import type { Metadata } from "next";
import { JobIdClient } from "@/features/jobs/components/JobIdClient";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { jobsQueries } from "@/features/jobs/queries/jobs.queries";
import { getCookiesToken } from "@/lib/auth.utils";

interface JobIdPageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ referrer: string }>;
}

export async function generateMetadata({ params }: JobIdPageProps): Promise<Metadata> {
  const { jobId } = await params;
  try {
    const token = (await getCookiesToken()) ?? "";
    const queryClient = createServerQueryClient();
    const job = await queryClient.fetchQuery(jobsQueries.detail(jobId, token));
    const title = job?.title && job?.company ? `${job.title} at ${job.company}` : "Job Details";
    return { title };
  } catch {
    return { title: "Job Details" };
  }
}

const JobIdPage = async ({ params, searchParams }: JobIdPageProps) => {
  const { jobId } = await params;
  const { referrer } = await searchParams;
  return <JobIdClient jobId={jobId} referrer={referrer} />;
};

export default JobIdPage;
