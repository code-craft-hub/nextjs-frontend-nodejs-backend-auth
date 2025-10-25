// lib/api/user.server.api.ts
import { serverApi } from './server.api';
import { User, PaginationParams, PaginatedResponse } from '@/lib/types';

export const userServerApi = {
  getUsers: (_params?: PaginationParams) =>
    serverApi.get<PaginatedResponse<User>>('/users', ),

  getUser: () => 
    serverApi.get<User>(`/users`),
};