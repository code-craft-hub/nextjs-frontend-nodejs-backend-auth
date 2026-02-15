import TailorCoverLetter from "./TailorCoverLetter";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const TailorCoverLetterPage = async ({ searchParams }: any) => {
  const token = (await getCookiesToken()) ?? "";
  const { coverLetterId } = await searchParams;

  const queryClient = createServerQueryClient();

  await queryClient.prefetchQuery(
    coverLetterQueries.detail(coverLetterId, token),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorCoverLetter />
      </div>
    </HydrationBoundary>
  );
};

export default TailorCoverLetterPage;
