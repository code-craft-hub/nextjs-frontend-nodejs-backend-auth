import type { IUser } from "@/types";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, PaginationParams } from "@/lib/types";
import type { CreateUserData, UpdateUserData, IRecentUser } from "./user.api.types";

export const userApi = {
  // Get all users (with pagination)
  getUsers: (_params?: PaginationParams) =>
    api.get<PaginatedResponse<IUser>>(`/users`),

  // Get user by ID
  getUser: async (token?: string) => {
    const data = await api.get<{ data: Partial<IUser>; success: boolean }>(
      `/users`,
      { token },
    );
    if (data?.success) return data.data;
    throw new Error("Failed to fetch user data");
  },

  // Create user
  createUser: (data: CreateUserData) => api.post<IUser>(`/users`, data),

  // Update user
  updateUser: (data: UpdateUserData) =>
    api.put<{ success: boolean; data: { userId: string } }>(`/users`, data),

  // Delete user
  deleteUser: () => api.delete<void>(`/auth/account`),

  // Admin: all users, cursor-paginated newest-first
  getRecentSignups: async (params?: {
    cursor?: string;
    limit?: number;
    token?: string;
  }) => {
    const { cursor, limit, token } = params ?? {};
    const qs = new URLSearchParams();
    if (cursor) qs.set("cursor", cursor);
    if (limit) qs.set("limit", String(limit));
    const query = qs.toString();

    const data = await api.get<{
      success: boolean;
      data: IRecentUser[];
      nextCursor: string | null;
    }>(`/users/admin/recent${query ? `?${query}` : ""}`, { token });

    if (data?.success) return { data: data.data, nextCursor: data.nextCursor };
    throw new Error("Failed to fetch recent signups");
  },
};
