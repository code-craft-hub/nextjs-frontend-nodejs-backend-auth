import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';

import { useAuth } from '../contexts/AuthContext';
import { authService, AuthServiceError } from '../lib/services/auth.service';
import { UserProfile, AuthUser } from '../types/auth';

// Query keys for consistent caching
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  profile: (uid: string) => ['auth', 'profile', uid] as const,
  customClaims: (uid: string) => ['auth', 'claims', uid] as const,
  permissions: (uid: string) => ['auth', 'permissions', uid] as const,
} as const;

/**
 * Query hook for user profile data
 * Automatically handles caching and background updates
 */
export function useUserProfileQuery(uid?: string): UseQueryResult<UserProfile | null> {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile(uid || ''),
    queryFn: async () => {
      if (!uid) return null;
      
      // This would typically call a Firestore service
      // For now, we'll use the auth service pattern
      const result = await authService.getUserProfile(uid);
      return result;
    },
    enabled: !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error instanceof AuthServiceError && error.code.includes('AUTH')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Query hook for user custom claims
 * Used for role and permission checking
 */
export function useCustomClaimsQuery(uid?: string): UseQueryResult<Record<string, unknown>> {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.customClaims(uid || ''),
    queryFn: async () => {
      if (!uid) return {};
      
      const result = await authService.refreshCustomClaims(uid);
      return result.success ? result.data || {} : {};
    },
    enabled: !!uid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Mutation hook for user authentication
 * Handles sign in with optimistic updates
 */
export function useSignInMutation(): UseMutationResult<
  AuthUser,
  AuthServiceError,
  { email: string; password: string }
> {
  const queryClient = useQueryClient();
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      await signIn(email, password);
      // The auth context will handle the state update
      // We return a placeholder here since the actual user comes from the context
      return {} as AuthUser;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      
      // Optionally set some optimistic data
      queryClient.setQueryData(['auth', 'lastEmail'], variables.email);
    },
    onError: (error) => {
      console.error('Sign in failed:', error);
      // Clear any cached authentication data on error
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
  });
}

/**
 * Mutation hook for user registration
 */
export function useSignUpMutation(): UseMutationResult<
  AuthUser,
  AuthServiceError,
  { email: string; password: string; displayName?: string }
> {
  const queryClient = useQueryClient();
  const { signUp } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password, displayName }) => {
      await signUp(email, password, displayName);
      return {} as AuthUser;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.setQueryData(['auth', 'lastEmail'], variables.email);
    },
    onError: (error) => {
      console.error('Sign up failed:', error);
    },
  });
}

/**
 * Mutation hook for password reset
 */
export function usePasswordResetMutation(): UseMutationResult<
  void,
  AuthServiceError,
  { email: string }
> {
  const { resetPassword } = useAuth();

  return useMutation({
    mutationFn: async ({ email }) => {
      await resetPassword(email);
    },
    onError: (error) => {
      console.error('Password reset failed:', error);
    },
  });
}

/**
 * Mutation hook for profile updates
 */
export function useUpdateProfileMutation(): UseMutationResult<
  UserProfile,
  AuthServiceError,
  Partial<UserProfile>
> {
  const queryClient = useQueryClient();
  const { updateProfile, user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      await updateProfile(updates);
      // Return updated profile - in real app, this would come from the API response
      return { ...user?.profile, ...updates } as UserProfile;
    },
    onMutate: async (updates) => {
      if (!user?.uid) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: AUTH_QUERY_KEYS.profile(user.uid) 
      });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(
        AUTH_QUERY_KEYS.profile(user.uid)
      );

      // Optimistically update profile
      queryClient.setQueryData(
        AUTH_QUERY_KEYS.profile(user.uid),
        (old: UserProfile | undefined) => old ? { ...old, ...updates } : undefined
      );

      return { previousProfile };
    },
    onError: (error, updates, context) => {
      if (!user?.uid || !context) return;

      // Rollback on error
      queryClient.setQueryData(
        AUTH_QUERY_KEYS.profile(user.uid),
        context.previousProfile
      );
    },
    onSettled: () => {
      if (!user?.uid) return;

      // Always refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: AUTH_QUERY_KEYS.profile(user.uid) 
      });
    },
  });
}

/**
 * Mutation hook for refreshing custom claims
 */
export function useRefreshClaimsMutation(): UseMutationResult<
  Record<string, unknown>,
  AuthServiceError,
  void
> {
  const queryClient = useQueryClient();
  const { refreshCustomClaims, user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await refreshCustomClaims();
      return {};
    },
    onSuccess: () => {
      if (!user?.uid) return;

      // Invalidate claims and permissions
      queryClient.invalidateQueries({ 
        queryKey: AUTH_QUERY_KEYS.customClaims(user.uid) 
      });
      queryClient.invalidateQueries({ 
        queryKey: AUTH_QUERY_KEYS.permissions(user.uid) 
      });
    },
  });
}

/**
 * Mutation hook for signing out
 */
export function useSignOutMutation(): UseMutationResult<void, AuthServiceError, void> {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      // Clear all authentication-related queries
      queryClient.removeQueries({ queryKey: ['auth'] });
      
      // Clear all user-specific data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Sign out failed:', error);
      // Still clear queries even if sign out fails
      queryClient.clear();
    },
  });
}

/**
 * Combined hook for authentication state with queries
 * Provides a unified interface for auth state and data fetching
 */
export function useAuthWithQueries() {
  const auth = useAuth();
  const profileQuery = useUserProfileQuery(auth.user?.uid);
  const claimsQuery = useCustomClaimsQuery(auth.user?.uid);

  const signInMutation = useSignInMutation();
  const signUpMutation = useSignUpMutation();
  const signOutMutation = useSignOutMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const passwordResetMutation = usePasswordResetMutation();
  const refreshClaimsMutation = useRefreshClaimsMutation();

  return {
    // Auth state from context
    ...auth,
    
    // Query states
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,
    
    customClaims: claimsQuery.data,
    isClaimsLoading: claimsQuery.isLoading,
    claimsError: claimsQuery.error,

    // Mutations
    signInMutation,
    signUpMutation,
    signOutMutation,
    updateProfileMutation,
    passwordResetMutation,
    refreshClaimsMutation,

    // Convenience methods
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    resetPassword: passwordResetMutation.mutateAsync,
    refreshClaims: refreshClaimsMutation.mutateAsync,

    // Loading states
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isResettingPassword: passwordResetMutation.isPending,
    isRefreshingClaims: refreshClaimsMutation.isPending,

    // Error states
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
    updateProfileError: updateProfileMutation.error,
    passwordResetError: passwordResetMutation.error,
    refreshClaimsError: refreshClaimsMutation.error,
  };
}

/**
 * Prefetch user data hook
 * Useful for preloading data before navigation
 */
export function usePrefetchUserData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const prefetchProfile = async (uid: string = user?.uid || '') => {
    if (!uid) return;

    await queryClient.prefetchQuery({
      queryKey: AUTH_QUERY_KEYS.profile(uid),
      queryFn: async () => {
        const result = await authService.getUserProfile(uid);
        return result;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchClaims = async (uid: string = user?.uid || '') => {
    if (!uid) return;

    await queryClient.prefetchQuery({
      queryKey: AUTH_QUERY_KEYS.customClaims(uid),
      queryFn: async () => {
        const result = await authService.refreshCustomClaims(uid);
        return result.success ? result.data || {} : {};
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchProfile,
    prefetchClaims,
    prefetchUserData: async (uid?: string) => {
      await Promise.all([
        prefetchProfile(uid),
        prefetchClaims(uid),
      ]);
    },
  };
}

/**
 * Hook for invalidating authentication queries
 * Useful for manual cache invalidation
 */
export function useInvalidateAuthQueries() {
  const queryClient = useQueryClient();

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
  };

  const invalidateProfile = (uid: string) => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile(uid) });
  };

  const invalidateClaims = (uid: string) => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.customClaims(uid) });
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  };

  return {
    invalidateUser,
    invalidateProfile,
    invalidateClaims,
    invalidateAll,
  };
}