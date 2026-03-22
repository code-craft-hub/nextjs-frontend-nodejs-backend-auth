import TailorCoverLetter from "@/features/cover-letter/components/TailorCoverLetter";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { coverLetterQueries } from "@/features/cover-letter/queries/cover-letter.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { isPlaceholderId } from "@/lib/utils/ai-apply-navigation";

const TailorCoverLetterPage = async ({ searchParams }: any) => {
  const token = (await getCookiesToken()) ?? "";
  const { coverLetterId } = await searchParams;

  const queryClient = createServerQueryClient();

  if (!isPlaceholderId(coverLetterId)) {
    await queryClient.prefetchQuery(
      coverLetterQueries.detail(coverLetterId, token),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorCoverLetter />
      </div>
    </HydrationBoundary>
  );
};

export default TailorCoverLetterPage;
