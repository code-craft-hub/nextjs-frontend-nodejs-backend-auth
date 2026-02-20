import { useQuery } from "@tanstack/react-query";
import { authQueries } from "../queries/auth.queryOptions";
import { useLoginMutation } from "../mutations/useLogin.mutation";
import { useLogoutMutation } from "../mutations/useLogout.mutation";
import { useRegisterMutation } from "../mutations/useRegister.mutation";
import type { LoginCredentials, RegisterData } from "../api/auth.api.types";

/**
 * Unified auth hook — provides current session state and all auth actions.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const sessionQuery = useQuery(authQueries.session());
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();
  const registerMutation = useRegisterMutation();

  return {
    // ─── State ────────────────────────────────────────────────
    user: sessionQuery.data?.user ?? null,
    session: sessionQuery.data ?? null,
    isAuthenticated: !!sessionQuery.data?.user,
    isLoading: sessionQuery.isLoading,
    isError: sessionQuery.isError,

    // ─── Actions ──────────────────────────────────────────────
    login: (credentials: LoginCredentials) =>
      loginMutation.mutateAsync(credentials),
    logout: () => logoutMutation.mutateAsync(),
    register: (data: RegisterData) => registerMutation.mutateAsync(data),

    // ─── Pending states ───────────────────────────────────────
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
