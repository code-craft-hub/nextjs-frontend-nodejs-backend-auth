import React from "react";
import { LandingPageClient } from "./LandingPageClient";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { JobFilters } from "@/lib/types/jobs";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { getDataSource } from "@/lib/utils/helpers";
import { getCookiesToken, getSessionFromCookies } from "@/lib/auth.utils";

export const dynamic = "force-dynamic";

const LandingPage = async () => {
  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();
  let user = null;
  let filters: JobFilters = {
    page: 1,
    limit: 10,
    title: "",
  };
  try {
    const cookieUser = await getSessionFromCookies();

    if (cookieUser) {
      user = await queryClient.fetchQuery(userQueries.detail(token));
      const userDataSource = getDataSource(user);

      filters = {
        page: 1,
        limit: 10,
        title: userDataSource?.key || userDataSource?.title || "",
      };
      await prefetchWithPriority(queryClient, [
        {
          queryKey: jobsQueries.all(filters).queryKey,
          queryFn: jobsQueries.all(filters, token).queryFn,
          priority: "high",
        },
      ]);
    }
  } catch (error) {
    console.error("Error in landing Page : ", error);
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPageClient filters={filters} user={user} />
    </HydrationBoundary>
  );
};

export default LandingPage;
