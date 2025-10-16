import React from "react";
import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { TailorCoverLetter } from "./TailorCoverLetter";
const TailorCoverLetterPage = async ({ searchParams, params }: any) => {
  const { jobDescription ,aiApply } = await searchParams;
  const { coverLetterId } = await params;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () =>
      apiService.getCareerDoc(coverLetterId, COLLECTIONS.COVER_LETTER),
  });

  return (
    <div className="">
      <div className="p-4 sm:p-8">
        <TailorCoverLetter
          jobDescription={jobDescription}
          coverLetterId={coverLetterId}
          aiApply={aiApply === "true"}
        />{" "}
      </div>
    </div>
  );
};

export default TailorCoverLetterPage;
