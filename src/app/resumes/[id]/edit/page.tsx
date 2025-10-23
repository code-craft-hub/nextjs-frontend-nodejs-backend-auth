// app/resumes/[id]/edit/page.tsx - Highly optimized edit page
import { createServerQueryClient } from '@/lib/query/prefetch';
import { prefetchWithPriority } from '@/lib/query/parallel-prefetch';
import { HydrationBoundary } from '@/components/hydration-boundary';
import { resumeQueries } from '@/lib/queries/resume.queries';
import { authQueries } from '@/lib/queries/auth.queries';
import { ResumeEditor } from '@/components/resume/resume-editor';
import { dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

interface ResumeEditPageProps {
  params: { id: string };
}

export default async function ResumeEditPage({ params }: ResumeEditPageProps) {
  const queryClient = createServerQueryClient();

  try {
    // Prefetch with priorities
    await prefetchWithPriority(queryClient, [
      {
        queryKey: resumeQueries.detail(params.id).queryKey,
        queryFn: resumeQueries.detail(params.id).queryFn,
        priority: 'high', // Most important data
      },
      {
        queryKey: authQueries.profile().queryKey,
        queryFn: authQueries.profile().queryFn,
        priority: 'high',
      },
      {
        queryKey: resumeQueries.all({ limit: 5 }).queryKey,
        queryFn: resumeQueries.all({ limit: 5 }).queryFn,
        priority: 'low', // Nice to have for "recent resumes" sidebar
      },
    ]);

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ResumeEditor id={params.id} />
      </HydrationBoundary>
    );
  } catch (error) {
    notFound();
  }
}

// Enable ISR with revalidation
export const revalidate = 60; // Revalidate every 60 seconds