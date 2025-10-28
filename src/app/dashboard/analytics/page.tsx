import React from "react";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@/lib/queries/user.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { AnalyticsCard } from "./components/AnalyticsCard";
import { UsageTrendDashboard } from "./components/line-bar-chart";
import { AnalyticsBarChart } from "./components/AnalyticsBarChart";

const AnalyticsPage = async () => {
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail());
  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="space-y-8">
        <AnalyticsCard />
        <UsageTrendDashboard />
        <AnalyticsBarChart />
      </div>
      </HydrationBoundary>
    </div>
  );
};

export default AnalyticsPage;
