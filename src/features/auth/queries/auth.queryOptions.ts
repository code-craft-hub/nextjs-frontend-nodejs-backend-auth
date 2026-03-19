import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authQueryKeys } from "./auth.queryKeys";

export const authQueries = {
  session: () =>
    queryOptions({
      queryKey: authQueryKeys.session(),
      queryFn: authApi.getSession,
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: false,
    }),

  profile: () =>
    queryOptions({
      queryKey: authQueryKeys.profile(),
      queryFn: authApi.getProfile,
      staleTime: 10 * 60 * 1000,
      retry: false,
    }),

  verificationTokenStatus: (token?: string) =>
    queryOptions({
      queryKey: authQueryKeys.verificationTokenStatus(),
      queryFn: () => authApi.getVerificationTokenStatus(token),
      staleTime: 0, // always fresh — page reloads are the exact scenario we handle
      retry: false,
    }),
};

// ─── Invalidation Helpers ──────────────────────────────────

export const invalidateAuthSession = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: authQueryKeys.sessions() });

export const invalidateAuthProfile = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: authQueryKeys.profiles() });

export const invalidateAuth = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: authQueryKeys.all });
