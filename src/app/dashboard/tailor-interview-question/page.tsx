import React from "react";
import { TailorInterviewQuestion } from "./TailorInterviewQuestion";

const TailorInterviewQuestionPage = async ({ searchParams }: any) => {
  const { jobDescription, documentId, coverletterId } = await searchParams;

  console.log("TailorInterviewQuestionPage server :", jobDescription, documentId, coverletterId);
  // const queryClient = getQueryClient();

  // queryClient.prefetchQuery({
  //   queryKey: ["auth", "careerDoc"],
  //   queryFn: () => apiService.getCareerDoc(documentId),
  // });
  // queryClient.prefetchQuery({
  //   queryKey: ["auth", "careerDoc"],
  //   queryFn: () => apiService.getCareerDoc(coverletterId),
  // });

  return (
    <div>
      <TailorInterviewQuestion
        jobDescription={jobDescription}
        documentId={documentId}
        coverletterId={coverletterId}
      />
    </div>
  );
};

export default TailorInterviewQuestionPage;
