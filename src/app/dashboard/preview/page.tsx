import Preview from "./Preview";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@module/user";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { getCookiesToken } from "@/lib/auth.utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PreviewPage = async ({ searchParams }: any) => {
  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail(token));
  const {
    "cover-letter-id": coverLetterId,
    "resume-id": resumeId,
    "recruiter-email": recruiterEmail,
    "job-description": jobDescription,
    "auto-apply-id": autoApplyId,
  } = await searchParams;

  await prefetchWithPriority(queryClient, [
    {
      queryKey: resumeQueries.detail(resumeId).queryKey,
      queryFn: resumeQueries.detail(resumeId, token).queryFn,
      priority: "high",
    },
    {
      queryKey: coverLetterQueries.detail(coverLetterId).queryKey,
      queryFn: coverLetterQueries.detail(coverLetterId, token).queryFn,
      priority: "high",
    },
  ]);

  return (
    <div className="p-4 sm:p-8 relative">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Preview
          coverLetterId={coverLetterId}
          resumeId={resumeId}
          recruiterEmail={recruiterEmail}
          jobDescription={jobDescription}
          autoApplyId={autoApplyId}
        />
      </HydrationBoundary>
    </div>
  );
};

export default PreviewPage;
