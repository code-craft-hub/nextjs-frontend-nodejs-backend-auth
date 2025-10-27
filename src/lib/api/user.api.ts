import { IUser } from "@/types";
import { api } from "./client";
import type { User, PaginatedResponse, PaginationParams } from "@/lib/types";

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateUserData<T = never> {
  data?: Partial<T>;
}

export const userApi = {
  // Get all users (with pagination)
  getUsers: (_params?: PaginationParams) =>
    api.get<PaginatedResponse<User>>("/users"),

  // Get user by ID
  getUser: async () => {
    const { data } = await api.get<{ data: Partial<IUser> }>(`/users`);
    return data;
  },

  // Create user
  createUser: (data: CreateUserData) => api.post<User>("/users", data),

  // Update user
  updateUser: (data: UpdateUserData) => api.put<User>(`/update-user`, data),

  // Delete user
  deleteUser: (id: string) => api.delete<void>(`/users/${id}`),

  // Batch operations
  deleteUsers: (ids: string[]) =>
    api.post<void>("/users/batch/delete", { ids }),
};
