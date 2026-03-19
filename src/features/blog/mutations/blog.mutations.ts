// lib/mutations/blog.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi, type CreateBlogData, type UpdateBlogData } from "@/features/blog/api/blog.api";
import { queryKeys } from "@/shared/query/keys";
import type { Blog, BlogWithViews, BlogListResponse } from "@/lib/types";

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogData) => blogApi.createBlog(data),
    onMutate: async (newBlog) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.lists() });
      const previousBlogs = queryClient.getQueryData(queryKeys.blogs.lists());
      queryClient.setQueriesData<BlogListResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: [
              {
                id: "temp-" + Date.now(),
                userId: null,
                ...newBlog,
                subtitle: newBlog.subtitle ?? null,
                summary: newBlog.summary ?? null,
                category: newBlog.category ?? null,
                status: newBlog.status ?? "draft",
                descriptionHtml: newBlog.descriptionHtml ?? null,
                descriptionText: newBlog.descriptionText ?? null,
                descriptionJson: newBlog.descriptionJson ?? null,
                authorName: newBlog.authorName ?? null,
                authorComment: newBlog.authorComment ?? null,
                authorAvatar: newBlog.authorAvatar ?? null,
                blogCover: newBlog.blogCover ?? null,
                bigThumbnail: newBlog.bigThumbnail ?? null,
                userEmail: newBlog.userEmail ?? null,
                related: null,
                fileLocationInStorage: null,
                importedAt: null,
                totalViews: 0,
              } as BlogWithViews,
              ...old.items,
            ],
            total: old.total + 1,
          };
        }
      );
      return { previousBlogs };
    },
    onError: (_err, _id, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueriesData({ queryKey: queryKeys.blogs.lists() }, context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.stats() });
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
      queryClient.setQueryData<BlogWithViews>(queryKeys.blogs.detail(id), (old) => {
        if (!old) return old;
        return { ...old, ...data, updatedAt: new Date().toISOString() };
      });
      queryClient.setQueriesData<BlogListResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((b) =>
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
      queryClient.setQueriesData<BlogListResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return { ...old, items: old.items.filter((b) => b.id !== id), total: old.total - 1 };
        }
      );
      return { previousBlogs };
    },
    onError: (_err, _id, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueriesData({ queryKey: queryKeys.blogs.lists() }, context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.stats() });
    },
  });
}

export function useTogglePublishBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: Blog["status"] }) => {
      const nextStatus: Blog["status"] = currentStatus === "publish" ? "draft" : "publish";
      return blogApi.updateBlog(id, { status: nextStatus, updatedAt: new Date().toISOString() });
    },
    onMutate: async ({ id, currentStatus }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.blogs.detail(id) });
      const previousBlog = queryClient.getQueryData<BlogWithViews>(queryKeys.blogs.detail(id));
      const nextStatus: Blog["status"] = currentStatus === "publish" ? "draft" : "publish";
      queryClient.setQueryData<BlogWithViews>(queryKeys.blogs.detail(id), (old) => {
        if (!old) return old;
        return { ...old, status: nextStatus, updatedAt: new Date().toISOString() };
      });
      queryClient.setQueriesData<BlogListResponse>(
        { queryKey: queryKeys.blogs.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((b) =>
              b.id === id ? { ...b, status: nextStatus, updatedAt: new Date().toISOString() } : b
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
    onSettled: (_err, _data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.lists() });
    },
  });
}