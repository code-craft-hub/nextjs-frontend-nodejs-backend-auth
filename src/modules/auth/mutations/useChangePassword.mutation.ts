"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { invalidateUserDetail } from "@/modules/user";
import type { ChangePasswordData } from "../api/auth.api.types";

/**
 * Mutation for changing or setting a password.
 *
 * Handles two cases:
 *  - Email/password users: `currentPassword` is required by the server.
 *  - Google-only users:    `currentPassword` is omitted (setting a password for the first time).
 *
 * On success the backend invalidates all other sessions and re-issues fresh
 * tokens for the current device — the user stays logged in.
 */
export function useChangePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
    onSuccess: () => {
      // Fresh cookies are now set by the server — invalidate cached user data
      // so any stale provider/profile info is refetched.
      invalidateUserDetail(queryClient);
    },
  });
}
