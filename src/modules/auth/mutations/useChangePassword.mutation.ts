"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth.api";
import type { ChangePasswordData } from "../api/auth.api.types";

/**
 * Mutation for changing or setting a password.
 *
 * Handles two cases:
 *  - Email/password users: `currentPassword` is required by the server.
 *  - Google-only users:    `currentPassword` is omitted (setting a password for the first time).
 *
 * On success the backend invalidates all sessions and clears auth cookies,
 * so we clear the query cache and redirect to /login.
 */
export function useChangePasswordMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ChangePasswordData) => authApi.changePassword(data),
    onSuccess: () => {
      // Backend clears auth cookies — all sessions are invalidated.
      // Wipe the local cache so stale session data isn't served on re-login.
      queryClient.clear();
      router.push("/login");
    },
  });
}
