import { TailorResume } from "./TailorResume";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getCookiesToken } from "@/lib/auth.utils";

const TailorResumePage = async ({ searchParams }: any) => {
  const { resumeId } = searchParams;
  const token = (await getCookiesToken()) ?? "";

  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(resumeQueries.detail(resumeId, token));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorResume />
      </div>
    </HydrationBoundary>
  );
};

export default TailorResumePage;
