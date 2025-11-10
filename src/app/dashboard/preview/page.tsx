import React from "react";
import Preview from "./Preview";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";

const PreviewPage = async ({ searchParams }: any) => {
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail());

  const { coverLetterId, resumeId, recruiterEmail, jobDescription } =
    await searchParams;
  // const baseResume = (await searchParams)?.baseResume;
  await prefetchWithPriority(queryClient, [
    {
      queryKey: resumeQueries.detail(resumeId).queryKey,
      queryFn: resumeQueries.detail(resumeId).queryFn,
      priority: "high",
    },
    {
      queryKey: coverLetterQueries.detail(coverLetterId).queryKey,
      queryFn: coverLetterQueries.detail(coverLetterId).queryFn,
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
          // baseResume={baseResume}
        />
      </HydrationBoundary>
    </div>
  );
};

export default PreviewPage;
