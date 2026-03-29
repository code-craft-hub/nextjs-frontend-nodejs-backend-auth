import type { Metadata } from "next";
import { HomeClient } from "@/features/dashboard/components/Home";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { dehydrate } from "@tanstack/react-query";
import { createServerQueryClient } from "@/shared/query/prefetch";
import { getCookiesToken } from "@/lib/auth.utils";
import { jobsQueries } from "@/features/jobs/queries/jobs.queries";
import { autoApplyQueries } from "@/features/auto-apply/queries/auto-apply.queries";
import { userQueries } from "@/features/user";

export const metadata: Metadata = {
  title: "Cver AI - Never Miss a Job Again",
  description: "Manage your career documents and interview prep",
};
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab: any; jobDescription: string }>;
}) {
  const { tab, jobDescription } = await searchParams;

  const token = (await getCookiesToken()) ?? "";

  const queryClient = createServerQueryClient();
  await queryClient.prefetchQuery(jobsQueries.autoApply(token));
  await queryClient.prefetchQuery(autoApplyQueries.all(token));
  await queryClient.fetchQuery(userQueries.detail(token));
  // console.log("USER", user);
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient tab={tab} jobDescription={jobDescription} />
    </HydrationBoundary>
  );
}
