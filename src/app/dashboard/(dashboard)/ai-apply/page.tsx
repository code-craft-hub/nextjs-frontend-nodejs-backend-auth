import React from "react";
import { AIApplyClient } from "./AIApplyClient";
import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";

const AIApplyPage = async ({ searchParams }: any) => {
  const { jobDescription, documentId } = await searchParams;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () => apiService.getCareerDoc(documentId),
  });

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <AIApplyClient jobDescription={jobDescription} documentId={documentId} />
    </div>
  );
};

export default AIApplyPage;
