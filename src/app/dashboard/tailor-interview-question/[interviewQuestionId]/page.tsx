import React from "react";
import { TailorInterviewQuestion } from "./TailorInterviewQuestion";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { interviewQuestionQueries } from "@/lib/queries/interview.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
const TailorInterviewQuestionPage = async ({ searchParams, params }: any) => {
  const { jobDescription } = await searchParams;
  const { interviewQuestionId } = await params;

  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(
    interviewQuestionQueries.detail(interviewQuestionId)
  );
  await queryClient.prefetchQuery(
    userQueries.detail()
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TailorInterviewQuestion
        jobDescription={jobDescription}
        interviewQuestionId={interviewQuestionId}
      />
     </HydrationBoundary> 
  );
};

export default TailorInterviewQuestionPage;
