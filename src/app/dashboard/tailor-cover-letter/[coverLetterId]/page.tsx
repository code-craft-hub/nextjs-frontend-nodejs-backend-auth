import TailorCoverLetter from "./TailorCoverLetter";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { userQueries } from "@/lib/queries/user.queries";
import { getCookiesToken } from "@/lib/auth.utils";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const TailorCoverLetterPage = async ({ searchParams, params }: any) => {
  const { jobDescription, aiApply, recruiterEmail, documentId } =
    await searchParams;
  const token = (await getCookiesToken()) ?? "";

  const { coverLetterId } = await params;
  const queryClient = createServerQueryClient();

  // Prefetch with documentId if available (reload case), otherwise coverLetterId
  const fetchId = documentId || coverLetterId;
  await queryClient.prefetchQuery(
    coverLetterQueries.detail(fetchId, token)
  );
  await queryClient.prefetchQuery(userQueries.detail(token));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <TailorCoverLetter
          jobDescription={jobDescription}
          coverLetterId={coverLetterId}
          aiApply={aiApply === "true"}
          recruiterEmail={recruiterEmail}
          documentId={documentId}
        />
      </div>
    </HydrationBoundary>
  );
};

export default TailorCoverLetterPage;
