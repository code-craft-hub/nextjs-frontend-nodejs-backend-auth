// lib/api/user.server.api.ts
import { serverApi } from './server.api';
import { User, PaginationParams, PaginatedResponse } from '@/lib/types';

export const userServerApi = {
  getUsers: (params?: PaginationParams) =>
    serverApi.get<PaginatedResponse<User>>('/users', { params }),

  getUser: (id: string) => 
    serverApi.get<User>(`/users/${id}`),
};