import React from "react";
import { TailorCoverLetter } from "./TailorCoverLetter";
import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
const TailorCoverLetterPage = async ({ searchParams }: any) => {
  const { jobDescription, documentId, coverletterId } = await searchParams;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () => apiService.getCareerDoc(documentId, COLLECTIONS.RESUME),
  });
  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () =>
      apiService.getCareerDoc(coverletterId, COLLECTIONS.COVER_LETTER),
  });
  return (
    <div>
      <TailorCoverLetter
        jobDescription={jobDescription}
        coverletterId={coverletterId}
      />
    </div>
  );
};

export default TailorCoverLetterPage;
