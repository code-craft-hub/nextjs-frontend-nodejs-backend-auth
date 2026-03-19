import { LandingPageClient } from "./LandingPageClient";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { jobsQueries } from "@/features/jobs/queries/jobs.queries";
import { prefetchWithPriority } from "@/shared/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { getCookiesToken, getSessionFromCookies } from "@/lib/auth.utils";

export const dynamic = "force-dynamic";

const LandingPage = async () => {
  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();
  let user = null;
  try {
    // Always prefetch featured jobs for the public landing page
    await prefetchWithPriority(queryClient, [
      {
        queryKey: jobsQueries.featured().queryKey,
        queryFn: jobsQueries.featured().queryFn,
        priority: "high",
      },
    ]);

    const cookieUser = await getSessionFromCookies();
    if (cookieUser) {
      user = await queryClient.fetchQuery(userQueries.detail(token));
    }
  } catch (error) {
    console.error("Error in landing Page : ", error);
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPageClient user={user} />
    </HydrationBoundary>
  );
};

export default LandingPage;
