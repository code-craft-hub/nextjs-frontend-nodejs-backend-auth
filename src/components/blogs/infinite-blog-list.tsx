// components/blogs/infinite-blog-list.tsx - Infinite scroll implementation
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { blogApi } from '@/lib/api/blog.api';
import { queryKeys } from '@/lib/query/keys';
import { useEffect, useRef } from 'react';

export function InfiniteBlogList() {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.blogs.lists(),
    queryFn: ({ pageParam = 1 }) =>
      blogApi.getBlogs({ page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allBlogs = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-4">
      {allBlogs.map((blog) => (
        <div
          key={blog.id}
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
        >
          <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
          <p className="text-gray-600 mb-2">{blog.excerpt}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                blog.published
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {blog.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      ))}

      {/* Loading indicator and intersection observer target */}
      <div ref={observerTarget} className="py-4 text-center">
        {isFetchingNextPage ? (
          <div className="text-gray-600">Loading more...</div>
        ) : hasNextPage ? (
          <div className="text-gray-400">Scroll for more</div>
        ) : (
          <div className="text-gray-400">No more blogs</div>
        )}
      </div>
    </div>
  );
}