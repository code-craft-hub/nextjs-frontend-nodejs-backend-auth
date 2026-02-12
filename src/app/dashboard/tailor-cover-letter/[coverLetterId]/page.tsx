import TailorCoverLetter from "./TailorCoverLetter";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { userQueries } from "@/lib/queries/user.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const TailorCoverLetterPage = async ({ params }: any) => {
  const token = (await getCookiesToken()) ?? "";
  const { coverLetterId } = await params;

  const queryClient = createServerQueryClient();

  // Prefetch with coverLetterId if it's available and not a placeholder
  if (coverLetterId && coverLetterId !== "pending") {
    await queryClient.prefetchQuery(
      coverLetterQueries.detail(coverLetterId, token),
    );
  }

  await queryClient.prefetchQuery(userQueries.detail(token));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorCoverLetter />
      </div>
    </HydrationBoundary>
  );
};

export default TailorCoverLetterPage;
