import React from "react";
import { TailorCoverLetter } from "./TailorCoverLetter";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { userQueries } from "@/lib/queries/user.queries";
const TailorCoverLetterPage = async ({ searchParams, params }: any) => {
  const { jobDescription, aiApply, recruiterEmail } = await searchParams;
  const { coverLetterId } = await params;
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(
    coverLetterQueries.detail(coverLetterId)
  );
  await queryClient.prefetchQuery(
    userQueries.detail()
  );

  return (
    <div className="">
      <div className="p-4 sm:p-8">
        <TailorCoverLetter
          jobDescription={jobDescription}
          coverLetterId={coverLetterId}
          aiApply={aiApply === "true"}
          recruiterEmail={recruiterEmail}
        />
      </div>
    </div>
  );
};

export default TailorCoverLetterPage;
