import React from "react";
import { TailorResume } from "./TailorResume";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";

const TailorResumePage = async ({ searchParams, params }: any) => {
  const { jobDescription, aiApply, coverLetterId, recruiterEmail } =
    await searchParams;
  const { resumeId } = await params;

  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(resumeQueries.detail(resumeId));
  const user = await queryClient.fetchQuery(userQueries.detail());
  const useMasterCV = user?.aiApplyPreferences?.useMasterCV;
  console.log(useMasterCV);

  // TODO: CHECK THE EXPIRY OF THE URL AND REFRESH IF NEEDED IN THE SERVER OR CLIENT

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorResume
          aiApply={aiApply === "true"}
          jobDescription={jobDescription}
          resumeId={resumeId}
          coverLetterId={coverLetterId}
          recruiterEmail={recruiterEmail}
        />
      </div>
    </HydrationBoundary>
  );
};

export default TailorResumePage;
