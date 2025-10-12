import React from "react";
import { TailorCoverLetter } from "./TailorCoverLetter";
import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
const TailorCoverLetterPage = async ({ searchParams }: any) => {
  const { jobDescription, coverletterId } = await searchParams;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () =>
      apiService.getCareerDoc(coverletterId, COLLECTIONS.COVER_LETTER),
  });
  return (
    <div>
     
      <div className="p-4 sm:p-8">
        <TailorCoverLetter
          jobDescription={jobDescription}
          coverletterId={coverletterId}
        />{" "}
      </div>
    </div>
  );
};

export default TailorCoverLetterPage;
