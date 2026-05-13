import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Preview from "@/features/email-application/components/Preview";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { userQueries } from "@features/user";
import { prefetchWithPriority } from "@/shared/query/parallel-prefetch";
import { resumeQueries } from "@/features/resume/queries/resume.queries";
import { coverLetterQueries } from "@/features/cover-letter/queries/cover-letter.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { aiSettingsQueries } from "@/features/ai-settings/queries/ai-settings.queries";
import { jobApplicationsApi } from "@/features/analytics/api/job-applications.api";

export const metadata: Metadata = {
  title: "Application Preview",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ jobId: string }>;
}

const EmailPreviewPage = async ({ params }: PageProps) => {
  const { jobId: applicationId } = await params;
  const token = (await getCookiesToken()) ?? "";

  const detailsResponse = await jobApplicationsApi.getDetails(applicationId, token);
  const app = detailsResponse?.data;

  if (!app) notFound();

  const coverLetterId = app.coverLetterId ?? "";
  const resumeId = app.resumeId ?? "";
  const recruiterEmail = app.recruiterEmail ?? "";

  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail(token));

  const prefetchTasks = [
    {
      queryKey: resumeQueries.detail(resumeId).queryKey,
      queryFn: resumeQueries.detail(resumeId, token).queryFn,
      priority: "high" as const,
    },
    {
      queryKey: coverLetterQueries.detail(coverLetterId).queryKey,
      queryFn: coverLetterQueries.detail(coverLetterId, token).queryFn,
      priority: "high" as const,
    },
    {
      queryKey: aiSettingsQueries.detail().queryKey,
      queryFn: aiSettingsQueries.detail(token).queryFn,
      priority: "high" as const,
    },
  ];

  await prefetchWithPriority(queryClient, prefetchTasks);

  return (
    <div className="p-4 sm:p-8 relative">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Preview
          coverLetterId={coverLetterId}
          resumeId={resumeId}
          recruiterEmail={recruiterEmail}
          jobDescription=""
          autoApplyId={applicationId}
          readOnly
        />
      </HydrationBoundary>
    </div>
  );
};

export default EmailPreviewPage;
