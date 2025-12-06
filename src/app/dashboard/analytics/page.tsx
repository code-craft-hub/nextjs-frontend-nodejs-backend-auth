import React from "react";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AnalyticsPage = async () => {
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail());
  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
       <AnalyticsClient />
      </HydrationBoundary>
    </div>
  );
};

export default AnalyticsPage;
