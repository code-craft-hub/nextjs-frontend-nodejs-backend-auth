import React from "react";
import { TailorCoverLetter } from "./TailorCoverLetter";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { userQueries } from "@/lib/queries/user.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@/lib/react-query";
const TailorCoverLetterPage = async ({ searchParams, params }: any) => {
  const { jobDescription, aiApply, recruiterEmail } = await searchParams;
    const token = (await getCookiesToken()) ?? "";
  
  const { coverLetterId } = await params;
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(
    coverLetterQueries.detail(coverLetterId, token)
  );
  await queryClient.prefetchQuery(
    userQueries.detail(token)
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorCoverLetter
          jobDescription={jobDescription}
          coverLetterId={coverLetterId}
          aiApply={aiApply === "true"}
          recruiterEmail={recruiterEmail}
        />
      </div>
    </HydrationBoundary>
  );
};

export default TailorCoverLetterPage;
