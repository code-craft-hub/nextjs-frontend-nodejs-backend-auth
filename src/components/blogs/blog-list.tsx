// components/blogs/blog-list.tsx - Client Component using prefetched data
'use client';

import { useQuery } from '@tanstack/react-query';
import { blogQueries } from '@/lib/queries/blog.queries';
// import { BlogCard } from './blog-card';

export function BlogList() {
  // Data is already prefetched, so this loads instantly without spinner
  const { data, isLoading } = useQuery(blogQueries.published());

  // With aggressive caching, isLoading is almost never true after SSR
  if (isLoading) {
    return <div>Loading...</div>; // Rarely shown
  }

  if (!data?.data.length) {
    return <div>No blogs found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* {data.data.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))} */}
    </div>
  );
}