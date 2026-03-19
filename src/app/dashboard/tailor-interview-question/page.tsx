import { TailorInterviewQuestion } from "./TailorInterviewQuestion";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { interviewQuestionQueries } from "@/features/interview/queries/interview.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getCookiesToken } from "@/lib/auth.utils";
const TailorInterviewQuestionPage = async ({ searchParams }: any) => {
  const { jobDescription } = await searchParams;
  const { interviewQuestionId } = await searchParams;
  const token = (await getCookiesToken()) ?? "";

  const queryClient = createServerQueryClient();

  if (interviewQuestionId) {
    await queryClient.prefetchQuery(
      interviewQuestionQueries.detail(interviewQuestionId ?? "", token),
    );
  }
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
