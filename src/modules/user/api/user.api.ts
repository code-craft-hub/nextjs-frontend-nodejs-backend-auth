import type { IUser } from "@/types";
import { api } from "@/lib/api/client";
import type { PaginatedResponse, PaginationParams } from "@/lib/types";
import type { CreateUserData, UpdateUserData } from "./user.api.types";

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
  createUser: (data: CreateUserData) =>
    api.post<IUser>(`/users`, data),

  // Update user
  updateUser: (data: UpdateUserData) =>
    api.put<{ success: boolean; data: { userId: string } }>(
      `/users`,
      data,
    ),

  // Delete user
  deleteUser: (id: string) =>
    api.delete<void>(`/users/${id}`),

  // Batch operations
  deleteUsers: (ids: string[]) =>
    api.post<void>(`/users/batch/delete`, { ids }),
};
