import Preview from "./Preview";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@module/user";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { aiSettingsQueries } from "@/lib/queries/ai-settings.queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PreviewPage = async ({ searchParams }: any) => {
  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail(token));
  const params = await searchParams;
  const coverLetterId = params["cover-letter-id"] ?? params["coverLetterId"];
  const resumeId = params["resume-id"] ?? params["resumeId"];
  const recruiterEmail = params["recruiter-email"] ?? params["recruiterEmail"];
  const jobDescription = params["job-description"] ?? params["jobDescription"];
  const autoApplyId = params["auto-apply-id"] ?? params["autoApplyId"];
  const masterCvId = params["master-cv-id"] ?? params["masterCvId"];

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

  if (masterCvId) {
    prefetchTasks.push({
      queryKey: resumeQueries.detail(masterCvId).queryKey,
      queryFn: resumeQueries.detail(masterCvId, token).queryFn,
      priority: "high" as const,
    });
  }

  await prefetchWithPriority(queryClient, prefetchTasks);

  return (
    <div className="p-4 sm:p-8 relative">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Preview
          coverLetterId={coverLetterId}
          resumeId={resumeId}
          recruiterEmail={recruiterEmail}
          jobDescription={jobDescription}
          autoApplyId={autoApplyId}
          masterCvId={masterCvId}
        />
      </HydrationBoundary>
    </div>
  );
};

export default PreviewPage;
