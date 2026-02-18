import type { IUser } from "@/types";
import { api, BACKEND_API_VERSION } from "@/lib/api/client";
import type { PaginatedResponse, PaginationParams } from "@/lib/types";
import type { CreateUserData, UpdateUserData } from "./user.api.types";

export const userApi = {
  // Get all users (with pagination)
  getUsers: (_params?: PaginationParams) =>
    api.get<PaginatedResponse<IUser>>(`/${BACKEND_API_VERSION}/users`),

  // Get user by ID
  getUser: async (token?: string) => {
    const data = await api.get<{ data: Partial<IUser>; success: boolean }>(
      `/${BACKEND_API_VERSION}/users`,
      { token },
    );
    if (data?.success) return data.data;
    throw new Error("Failed to fetch user data");
  },

  // Create user
  createUser: (data: CreateUserData) =>
    api.post<IUser>(`/${BACKEND_API_VERSION}/users`, data),

  // Update user
  updateUser: (data: UpdateUserData) =>
    api.put<{ success: boolean; data: { userId: string } }>(
      `/${BACKEND_API_VERSION}/users`,
      data,
    ),

  // Delete user
  deleteUser: (id: string) =>
    api.delete<void>(`/${BACKEND_API_VERSION}/users/${id}`),

  // Batch operations
  deleteUsers: (ids: string[]) =>
    api.post<void>(`/${BACKEND_API_VERSION}/users/batch/delete`, { ids }),
};
