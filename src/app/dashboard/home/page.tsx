import { requireOnboarding } from "@/lib/server-auth";
import type { Metadata } from "next";
import { DashboardTab } from "@/types/index.js";
import { HomeClient } from "./Home.tsx";
import { createServerQueryClient } from "@/lib/query/prefetch";
import { prefetchWithPriority } from "@/lib/query/parallel-prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { jobsQueries } from "@/lib/queries/jobs.queries";
import { dehydrate } from "@tanstack/react-query";
import { JobFilters } from "@/lib/types/jobs";
import { userQueries } from "@/lib/queries/user.queries";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { aiApplyQueries } from "@/lib/queries/ai-apply.queries";
import { interviewQuestionQueries } from "@/lib/queries/interview.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { getDataSource } from "@/lib/utils/helpers";

export const metadata: Metadata = {
  title: "Cver AI - Never Miss a Job Again",
  description: "Manage your career documents and interview prep",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab: DashboardTab; jobDescription: string }>;
}) {
  await requireOnboarding();
  const queryClient = createServerQueryClient();
  const user = await queryClient.fetchQuery(userQueries.detail());
  const { tab, jobDescription } = await searchParams;

  const title = getDataSource(user)?.title;
  const rolesOfInterest = getDataSource(user)?.rolesOfInterest?.map(
    (role: any) => role.value
  );
  const filters: JobFilters = {
    page: 1,
    limit: 20,
    title: title || "",
  };
  const autoApplyFilters: JobFilters = {
    page: 1,
    limit: 20,
    title: title || "",
    skills: JSON.stringify(rolesOfInterest),
  };
  await prefetchWithPriority(queryClient, [
    {
      queryKey: jobsQueries.all(filters).queryKey,
      queryFn: jobsQueries.all(filters).queryFn,
      priority: "high",
    },
    {
      queryKey: jobsQueries.autoApply(autoApplyFilters).queryKey,
      queryFn: jobsQueries.autoApply(autoApplyFilters).queryFn,
      priority: "high",
    },
    {
      queryKey: resumeQueries.all(filters).queryKey,
      queryFn: resumeQueries.all(filters).queryFn,
      priority: "high",
    },
    {
      queryKey: interviewQuestionQueries.all(filters).queryKey,
      queryFn: interviewQuestionQueries.all(filters).queryFn,
      priority: "high",
    },
    {
      queryKey: coverLetterQueries.all(filters).queryKey,
      queryFn: coverLetterQueries.all(filters).queryFn,
      priority: "high",
    },
    {
      queryKey: aiApplyQueries.all(filters).queryKey,
      queryFn: aiApplyQueries.all(filters).queryFn,
      priority: "high",
    },
  ]);

  await queryClient.prefetchInfiniteQuery(jobsQueries.infinite(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient tab={tab} jobDescription={jobDescription} filters={filters} autoApplyFilters={autoApplyFilters} />
    </HydrationBoundary>
  );
}
