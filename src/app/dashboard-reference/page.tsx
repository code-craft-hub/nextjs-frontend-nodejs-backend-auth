// app/dashboard/page.tsx - Dashboard with multiple prefetched resources
import { createServerQueryClient, prefetchQueries } from "@/lib/query/prefetch";
import { HydrationBoundary } from "@/components/hydration-boundary";
import { authQueries } from "@/lib/queries/auth.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { interviewQuestionQueries } from "@/lib/queries/interview.queries";
import { Dashboard } from "@/components/dashboard/dashboard";
import { dehydrate } from "@tanstack/react-query";

export default async function DashboardPage() {
  const queryClient = createServerQueryClient();

  // Prefetch ALL dashboard data in parallel on server
  await prefetchQueries(queryClient, [
    {
      queryKey: authQueries.profile().queryKey,
      queryFn: authQueries.profile().queryFn,
    },
    {
      queryKey: coverLetterQueries.all({ limit: 5 }).queryKey,
      queryFn: coverLetterQueries.all({ limit: 5 }).queryFn,
    },
    {
      queryKey: resumeQueries.all({ limit: 5 }).queryKey,
      queryFn: resumeQueries.all({ limit: 5 }).queryFn,
    },
    {
      queryKey: interviewQuestionQueries.all({ limit: 10 }).queryKey,
      queryFn: interviewQuestionQueries.all({ limit: 10 }).queryFn,
    },
  ]);

  // All data loads instantly on client - no loading states!
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  );
}
