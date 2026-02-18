import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@module/user";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import AnalyticsClient from "./AnalyticsClient";
import { getCookiesToken } from "@/lib/auth.utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AnalyticsPage = async () => {
    const token = (await getCookiesToken()) ?? "";

  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(userQueries.detail(token));
  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
       <AnalyticsClient />
      </HydrationBoundary>
    </div>
  );
};

export default AnalyticsPage;
