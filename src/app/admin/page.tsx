import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { getCookiesToken } from "@/lib/auth.utils";
import { userQueries } from "@module/user";
import AdminPageClient from "./AdminPageClient";

export default async function AdminPage() {
  const token = await getCookiesToken();
  const queryClient = createServerQueryClient();

  if (token) {
    await Promise.all([
      queryClient.prefetchQuery(userQueries.detail(token)),
      queryClient.prefetchQuery(userQueries.adminRecentSignups(token)),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminPageClient />
    </HydrationBoundary>
  );
}
