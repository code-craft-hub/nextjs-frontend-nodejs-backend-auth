// lib/api/blog.api.ts
import { api } from "@/shared/api/client";
import type {
  BlogWithViews,
  BlogStats,
  BlogListResponse,
  BlogViewHistory,
  Blog,
} from "@/shared/types/lib.types";

export interface BlogFilters {
  status?: "publish" | "draft" | "archived";
  category?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface CreateBlogData {
  title: string;
  subtitle?: string;
  summary?: string;
  category?: string;
  status?: "publish" | "draft" | "archived";
  descriptionHtml?: string;
  descriptionText?: string;
  descriptionJson?: string;
  authorName?: string;
  authorComment?: string;
  authorAvatar?: string;
  blogCover?: string;
  bigThumbnail?: string;
  userEmail?: string;
  related?: unknown;
  fileLocationInStorage?: unknown;
  createdAt: string;
  updatedAt: string;
}

export type UpdateBlogData = Partial<Omit<CreateBlogData, "createdAt">>;

// ─── API ────────────────────────────────────────────────────────────────────

type ApiWrap<T> = { success: boolean; data: T };

export const blogApi = {
  getBlogs: (params?: BlogFilters): Promise<BlogListResponse> =>
    api
      .get<ApiWrap<BlogListResponse>>("/blogs", {
        params: params as Record<string, string | number | boolean | null | undefined>,
      })
      .then((r) => r.data),

  getStats: (): Promise<BlogStats> =>
    api.get<ApiWrap<BlogStats>>("/blogs/stats").then((r) => r.data),

  getBlog: (id: string): Promise<BlogWithViews> =>
    api.get<ApiWrap<BlogWithViews>>(`/blogs/${id}`).then((r) => r.data),

  recordView: (id: string): Promise<void> =>
    api.post<void>(`/blogs/${id}/view`),

  getViewHistory: (id: string, days = 30): Promise<BlogViewHistory[]> =>
    api
      .get<ApiWrap<BlogViewHistory[]>>(`/blogs/${id}/analytics`, {
        params: { days },
      })
      .then((r) => r.data),

  createBlog: (data: CreateBlogData): Promise<Blog> =>
    api.post<ApiWrap<Blog>>("/blogs", data).then((r) => r.data),

  updateBlog: (id: string, data: UpdateBlogData): Promise<Blog> =>
    api.patch<ApiWrap<Blog>>(`/blogs/${id}`, data).then((r) => r.data),

  deleteBlog: (id: string): Promise<void> =>
    api.delete<void>(`/blogs/${id}`),
};