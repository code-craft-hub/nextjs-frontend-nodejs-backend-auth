import { dehydrate } from "@tanstack/react-query";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { getCookiesToken } from "@/lib/auth.utils";
import { userQueries } from "@module/user";
import AdminPageClient from "./AdminPageClient";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const token = await getCookiesToken();
  const queryClient = createServerQueryClient();

  if (token) {
    const [user] = await Promise.all([
      queryClient.fetchQuery(userQueries.detail(token)),
      queryClient.prefetchQuery(userQueries.adminRecentSignups(token)),
    ]);
    if (user?.role !== "admin") redirect("/dashboard/home");
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminPageClient />
    </HydrationBoundary>
  );
}
