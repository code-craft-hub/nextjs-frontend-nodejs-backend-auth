// lib/mutations/blog.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blogApi, type CreateBlogData, type UpdateBlogData } from '@/lib/api/blog.api';
import { queryKeys } from '@/lib/query/keys';
import type { Blog, PaginatedResponse } from '@/lib/types';

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogData) => blogApi.createBlog(data),
    onMutate: async (newBlog) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.lists() });

      const previousBlogs = queryClient.getQueryData(queryKeys.blogs.lists());

      queryClient.setQueriesData<PaginatedResponse<Blog>>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: [
              {
                id: 'temp-' + Date.now(),
                authorId: 'temp',
                ...newBlog,
                published: newBlog.published || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Blog,
              ...old.data,
            ],
            total: old.total + 1,
          };
        }
      );

      return { previousBlogs };
    },
    onError: (_err, _id, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.blogs.lists() },
          context.previousBlogs
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.published() });
    },
  });
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogData }) =>
      blogApi.updateBlog(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.detail(id) });

      const previousBlog = queryClient.getQueryData(queryKeys.blogs.detail(id));

      queryClient.setQueryData<Blog>(queryKeys.blogs.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });

      queryClient.setQueriesData<PaginatedResponse<Blog>>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((b) =>
              b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
            ),
          };
        }
      );

      return { previousBlog };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousBlog) {
        queryClient.setQueryData(queryKeys.blogs.detail(id), context.previousBlog);
      }
    },
    onSettled: (_err, _id, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.published() });
    },
  });
}

export function useDeleteBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.deleteBlog(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.lists() });

      const previousBlogs = queryClient.getQueryData(queryKeys.blogs.lists());

      queryClient.setQueriesData<PaginatedResponse<Blog>>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((b) => b.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousBlogs };
    },
    onError: (_err, _id, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.blogs.lists() },
          context.previousBlogs
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.published() });
    },
  });
}

export function useTogglePublishBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogApi.togglePublish(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.detail(id) });

      const previousBlog = queryClient.getQueryData<Blog>(queryKeys.blogs.detail(id));

      queryClient.setQueryData<Blog>(queryKeys.blogs.detail(id), (old) => {
        if (!old) return old;
        return { ...old, published: !old.published, updatedAt: new Date().toISOString() };
      });

      queryClient.setQueriesData<PaginatedResponse<Blog>>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((b) =>
              b.id === id ? { ...b, published: !b.published, updatedAt: new Date().toISOString() } : b
            ),
          };
        }
      );

      return { previousBlog };
    },
    onError: (_err, id, context) => {
      if (context?.previousBlog) {
        queryClient.setQueryData(queryKeys.blogs.detail(id), context.previousBlog);
      }
    },
    onSettled: (_err, _id, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.published() });
    },
  });
}