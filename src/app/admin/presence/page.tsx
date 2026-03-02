import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { getCookiesToken } from "@/lib/auth.utils";
import { userQueries } from "@module/user";
import { presenceQueries } from "@/modules/presence";
import PresencePageClient from "./PresencePageClient";

export default async function PresencePage() {
  const token = await getCookiesToken();
  const queryClient = createServerQueryClient();

  if (token) {
    await Promise.all([
      queryClient.prefetchQuery(userQueries.detail(token)),
      queryClient.prefetchQuery(presenceQueries.stats(token)),
      queryClient.prefetchInfiniteQuery({
        ...presenceQueries.activeUsersInfinite(token),
        pages: 1,
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PresencePageClient />
    </HydrationBoundary>
  );
}
