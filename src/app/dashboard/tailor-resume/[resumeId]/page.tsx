import {TailorResume}  from "./TailorResume";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { getCookiesToken } from "@/lib/auth.utils";

const TailorResumePage = async ({ params }: any) => {
  const { resumeId } = await params;
  const token = (await getCookiesToken()) ?? "";

  const queryClient = createServerQueryClient();
  
  // Prefetch resume data if resumeId is available and not a placeholder
  if (resumeId && resumeId !== "pending") {
    await queryClient.prefetchQuery(resumeQueries.detail(resumeId, token));
  }
  
  await queryClient.fetchQuery(userQueries.detail(token));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorResume />
      </div>
    </HydrationBoundary>
  );
};

export default TailorResumePage;
