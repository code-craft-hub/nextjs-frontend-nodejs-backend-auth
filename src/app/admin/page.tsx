import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { getCookiesToken, getSessionFromCookies } from "@/lib/auth.utils";
import { userQueries } from "@module/user";
import AdminPageClient from "./AdminPageClient";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const token = await getCookiesToken();
  const cookieUser = await getSessionFromCookies();
  const queryClient = createServerQueryClient();

  if (token) {
    await Promise.all([
      queryClient.prefetchQuery(userQueries.detail(token)),
      queryClient.prefetchInfiniteQuery({
        ...userQueries.adminRecentSignupsInfinite(token),
        pages: 1,
      }),
    ]);
  }

  if (cookieUser?.role !== "admin") redirect("/dashboard/home");
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminPageClient />
    </HydrationBoundary>
  );
}
