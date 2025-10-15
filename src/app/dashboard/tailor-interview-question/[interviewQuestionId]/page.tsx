import React from "react";
import { TailorInterviewQuestion } from "./TailorInterviewQuestion";

import { getQueryClient } from "@/lib/query-client";
import { apiService } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
const TailorInterviewQuestionPage = async ({ searchParams, params }: any) => {
  const { jobDescription } = await searchParams;
  const { interviewQuestionId } = await params;

  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["auth", "careerDoc"],
    queryFn: () =>
      apiService.getCareerDoc(
        interviewQuestionId,
        COLLECTIONS.INTERVIEW_QUESTION
      ),
  });

  return (
    <div>
      <TailorInterviewQuestion
        jobDescription={jobDescription}
        interviewQuestionId={interviewQuestionId}
      />
    </div>
  );
};

export default TailorInterviewQuestionPage;
