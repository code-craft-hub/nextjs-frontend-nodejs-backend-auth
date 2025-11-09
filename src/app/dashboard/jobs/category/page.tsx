import React from "react";
import { Category } from "./CategoryClient";
import { requireOnboarding } from "@/lib/server-auth";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { getDataSource } from "@/lib/utils/helpers";

const CategoryPage = async ({ searchParams }: any) => {
  await requireOnboarding();
  const tab = (await searchParams)?.tab;

  const queryClient = createServerQueryClient();
  const user = await queryClient.fetchQuery(userQueries.detail());
  const bookmarkedIds = (user.bookmarkedJobs || []) as string[];
  const appliedJobsIds = (user.appliedJobs?.map((job) => job.id) || []) as string[];
  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";
  const filters = {
    limit: 20,
  };

  await queryClient.prefetchInfiniteQuery(jobsQueries.infinite(filters));
  await queryClient.prefetchInfiniteQuery(
    jobsQueries.bookmarked(bookmarkedIds, "", 20)
  );
  await queryClient.prefetchInfiniteQuery(
    jobsQueries.appliedJobs(appliedJobsIds, "", 20)
  );
  await queryClient.prefetchInfiniteQuery(
  jobsQueries.infinite({title: userJobTitlePreference})
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 sm:p-8">
        <Category tab={tab} />
      </div>
    </HydrationBoundary>
  );
};

export default CategoryPage;
