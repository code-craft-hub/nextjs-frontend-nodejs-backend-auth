// lib/api/blog.api.ts
import { api } from './client';
import type { Blog, PaginatedResponse, PaginationParams } from '@/lib/types';

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published?: boolean;
  tags?: string[];
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  published?: boolean;
  tags?: string[];
}

export interface BlogFilters extends PaginationParams {
  published?: boolean;
  tag?: string;
  search?: string;
  authorId?: string;
}

export const blogApi = {
  // Get all blogs
  getBlogs: (_params?: BlogFilters) =>
    api.get<PaginatedResponse<Blog>>('/blogs'),

  // Get published blogs
  getPublishedBlogs: (_params?: PaginationParams) =>
    api.get<PaginatedResponse<Blog>>('/blogs/published'),

  // Get blog by ID
  getBlog: (id: string) =>
    api.get<Blog>(`/blogs/${id}`),

  // Get blog by slug
  getBlogBySlug: (slug: string) =>
    api.get<Blog>(`/blogs/slug/${slug}`),

  // Create blog
  createBlog: (data: CreateBlogData) =>
    api.post<Blog>('/blogs', data),

  // Update blog
  updateBlog: (id: string, data: UpdateBlogData) =>
    api.patch<Blog>(`/blogs/${id}`, data),

  // Delete blog
  deleteBlog: (id: string) =>
    api.delete<void>(`/blogs/${id}`),

  // Publish/unpublish blog
  togglePublish: (id: string) =>
    api.patch<Blog>(`/blogs/${id}/toggle-publish`),
};