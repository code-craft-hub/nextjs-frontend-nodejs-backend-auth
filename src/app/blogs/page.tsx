// app/blogs/page.tsx - Server Component with Prefetching
import { createServerQueryClient, prefetchQueries } from '@/lib/query/prefetch';
import { HydrationBoundary } from '@/components/hydration-boundary';
import { blogQueries } from '@/lib/queries/blog.queries';
import { BlogList } from '@/components/blogs/blog-list';

export default async function BlogsPage() {
  const queryClient = createServerQueryClient();

  // Prefetch data on the server
  const dehydratedState = await prefetchQueries(queryClient, [
    {
      queryKey: blogQueries.published().queryKey,
      queryFn: blogQueries.published().queryFn,
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
        {/* Client component receives prefetched data instantly */}
        <BlogList />
      </div>
    </HydrationBoundary>
  );
}