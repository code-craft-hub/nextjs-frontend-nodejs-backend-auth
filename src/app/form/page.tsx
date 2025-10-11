import React from "react";
// import EditResumeTemplate from "../dashboard/(dashboard)/ai-apply/components/resume/EditResumeTemplate";
import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";
import JobAnalyzer from "./InterviewQuestion";


const FormPage = async ({ searchParams }: any) => {
  const { documentId, coverletterId } = await searchParams;
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () => apiService.getCareerDoc(documentId),
  });
  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () => apiService.getCareerDoc(coverletterId),
  });

  return (
    <div>
      <JobAnalyzer 
      
      // documentId={documentId}
      
      />
    </div>
  );
};

export default FormPage;
