import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobIdClient } from "@/features/jobs/components/JobIdClient";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { jobsQueries } from "@/features/jobs/queries/jobs.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { jobApplicationsApi } from "@/features/analytics/api/job-applications.api";

interface JobIdPageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ referrer: string }>;
}

async function resolveToJobId(id: string, token: string): Promise<string> {
  try {
    const queryClient = createServerQueryClient();
    const job = await queryClient.fetchQuery(jobsQueries.detail(id, token));
    if (job?.data?.id) return id;
  } catch {
    // not a valid job ID — fall through
  }
  try {
    const app = await jobApplicationsApi.getDetails(id, token);
    if (app?.data?.jobId) return app.data.jobId;
  } catch {
    // application not found either
  }
  return id;
}

export async function generateMetadata({ params }: JobIdPageProps): Promise<Metadata> {
  const { jobId } = await params;
  try {
    const token = (await getCookiesToken()) ?? "";
    const resolvedId = await resolveToJobId(jobId, token);
    const queryClient = createServerQueryClient();
    const job = await queryClient.fetchQuery(jobsQueries.detail(resolvedId, token));
    const title = job?.data?.title
      ? `${job.data.title}${job.data.companyName ? ` at ${job.data.companyName}` : ""}`
      : "Job Details";
    return { title };
  } catch {
    return { title: "Job Details" };
  }
}

const JobIdPage = async ({ params, searchParams }: JobIdPageProps) => {
  const { jobId } = await params;
  const { referrer } = await searchParams;
  const token = (await getCookiesToken()) ?? "";
  const resolvedId = await resolveToJobId(jobId, token);

  if (resolvedId !== jobId) {
    const qs = referrer ? `?referrer=${referrer}` : "";
    redirect(`/dashboard/jobs/${resolvedId}${qs}`);
  }

  return <JobIdClient jobId={jobId} referrer={referrer} />;
};

export default JobIdPage;
