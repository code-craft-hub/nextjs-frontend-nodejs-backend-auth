import { IUser } from "@/types";
import { api } from "./client";
import type { User, PaginatedResponse, PaginationParams } from "@/lib/types";

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: string;
}

export const userApi = {
  // Get all users (with pagination)
  getUsers: (_params?: PaginationParams) =>
    api.get<PaginatedResponse<User>>("/users"),

  // Get user by ID
  getUser: (id: string) => api.get<{ data: Partial<IUser> }>(`/users/${id}`),

  // Create user
  createUser: (data: CreateUserData) => api.post<User>("/users", data),

  // Update user
  updateUser: (id: string, data: UpdateUserData) =>
    api.patch<User>(`/users/${id}`, data),

  // Delete user
  deleteUser: (id: string) => api.delete<void>(`/users/${id}`),

  // Batch operations
  deleteUsers: (ids: string[]) =>
    api.post<void>("/users/batch/delete", { ids }),
};
