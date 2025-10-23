// app/blogs/[id]/page.tsx - Detail page with SSR prefetching
import { createServerQueryClient, prefetchQuery } from '@/lib/query/prefetch';
import { HydrationBoundary } from '@/components/hydration-boundary';
import { blogQueries } from '@/lib/queries/blog.queries';
import { BlogDetail } from '@/components/blogs/blog-detail';
import { notFound } from 'next/navigation';

interface BlogDetailPageProps {
  params: { id: string };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const queryClient = createServerQueryClient();

  try {
    // Prefetch blog detail on server
    const dehydratedState = await prefetchQuery(
      queryClient,
      blogQueries.detail(params.id).queryKey,
      blogQueries.detail(params.id).queryFn
    );

    return (
      <HydrationBoundary state={dehydratedState}>
        <BlogDetail id={params.id} />
      </HydrationBoundary>
    );
  } catch (error) {
    notFound();
  }
}

// Optional: Generate static params for static generation
export async function generateStaticParams() {
  // This would fetch all blog IDs for static generation
  // For dynamic apps, you can skip this
  return [];
}