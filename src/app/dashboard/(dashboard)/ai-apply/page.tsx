import React from "react";
import { AIApplyClient } from "./AIApplyClient";
import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";

const AIApplyPage = async ({ searchParams }: any) => {
  const { jobDescription, documentId,coverletterId } = await searchParams;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () => apiService.getCareerDoc(documentId, COLLECTIONS.RESUME),
  });
  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () => apiService.getCareerDoc(coverletterId, COLLECTIONS.COVER_LETTER),
  });

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <AIApplyClient jobDescription={jobDescription} documentId={documentId} coverletterId={coverletterId} />
    </div>
  );
};

export default AIApplyPage;
