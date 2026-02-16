import Preview from "./Preview";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
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
    coverLetterDocId,
    resumeDocId,
    recruiterEmail,
    jobDescription,
    aiApplyId,
  } = await searchParams;

  
  await prefetchWithPriority(queryClient, [
    {
      queryKey: resumeQueries.detail(resumeDocId).queryKey,
      queryFn: resumeQueries.detail(resumeDocId, token).queryFn,
      priority: "high",
    },
    {
      queryKey: coverLetterQueries.detail(coverLetterDocId).queryKey,
      queryFn: coverLetterQueries.detail(coverLetterDocId, token).queryFn,
      priority: "high",
    },
  ]);

  return (
    <div className="p-4 sm:p-8 relative">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Preview
          coverLetterId={coverLetterDocId}
          resumeId={resumeDocId}
          recruiterEmail={recruiterEmail}
          jobDescription={jobDescription}
          aiApplyId={aiApplyId}
        />
      </HydrationBoundary>
    </div>
  );
};

export default PreviewPage;
