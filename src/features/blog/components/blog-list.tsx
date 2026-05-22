'use client';

import { useQuery } from '@tanstack/react-query';
import { blogQueries } from '@/features/blog/queries/blog.queries';

export function BlogList() {
  const { data, isLoading } = useQuery(blogQueries.published());

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data?.items.length) {
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
