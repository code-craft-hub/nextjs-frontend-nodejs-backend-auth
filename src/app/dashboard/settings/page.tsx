import { getCookiesToken } from "@/lib/auth.utils";
import Settings from "./Settings";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { aiSettingsQueries } from "@/lib/queries/ai-settings.queries";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";

const SettingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tab: string }>;
}) => {
  const { tab } = await searchParams;

  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(aiSettingsQueries.detail(token));
  
  return (
    <div className="p-4 sm:p-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Settings tab={tab} />
      </HydrationBoundary>
    </div>
  );
};

export default SettingsPage;
