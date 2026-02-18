import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { userQueries } from "@module/user";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { getCookiesToken } from "@/lib/auth.utils";
import { aiSettingsQueries } from "@/lib/queries/ai-settings.queries";
import AutoApplyClient from "./AutoApplyClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AutoApplyPage() {
  const token = (await getCookiesToken()) ?? "";
  const queryClient = createServerQueryClient();

  await prefetchWithPriority(queryClient, [
    {
      queryKey: userQueries.detail().queryKey,
      queryFn: userQueries.detail(token).queryFn,
      priority: "high",
    },
    {
      queryKey: aiSettingsQueries.detail().queryKey,
      queryFn: aiSettingsQueries.detail(token).queryFn,
      priority: "high",
    },
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AutoApplyClient />
    </HydrationBoundary>
  );
}
