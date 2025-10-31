import React from "react";
import { requireOnboarding } from "@/lib/server-auth";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import Overview from "./components/Overview";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { JobFilters } from "@/lib/types/jobs";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const JobListingsPage = async () => {
  await requireOnboarding();
  const queryClient = createServerQueryClient();
  await queryClient.fetchQuery(userQueries.detail());

  const filters: JobFilters = {
    limit: 20,
  };

  await queryClient.prefetchInfiniteQuery({
    queryKey: jobsQueries.infinite(filters).queryKey,
    initialPageParam: 1,
    queryFn: async ({
      queryKey,
      pageParam = jobsQueries.infinite(filters).initialPageParam,
    }) => {
      const infiniteQuery = jobsQueries.infinite(filters);
      if (!infiniteQuery.queryFn) throw new Error("queryFn is undefined");
      return await infiniteQuery.queryFn({
        client: queryClient,
        queryKey: queryKey as (string | JobFilters)[],
        signal: new AbortController().signal,
        pageParam: pageParam as number,
        direction: "forward",
        meta: undefined,
      });
    },
  });
  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Overview />
      </HydrationBoundary>
    </div>
  );
};

export default JobListingsPage;
