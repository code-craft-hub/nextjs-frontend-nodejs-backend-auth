// lib/api/user.server.api.ts
import { serverApi } from './server.api';
import { PaginationParams, PaginatedResponse } from '@/lib/types';

export const userServerApi = {
  getUsers: (_params?: PaginationParams) =>
    serverApi.get<PaginatedResponse<any>>('/users', ),

  getUser: () => 
    serverApi.get<any>(`/users`),
};