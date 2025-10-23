// lib/mutations/auth.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import { queryKeys } from '@/lib/query/keys';
import type { LoginCredentials, RegisterData } from '@/lib/types';

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // Set session data immediately
      queryClient.setQueryData(queryKeys.auth.session(), data);
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
      
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.coverLetters.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.interviewQuestions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.session(), data);
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

export function useRefreshTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.refresh,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.session(), data);
    },
  });
}