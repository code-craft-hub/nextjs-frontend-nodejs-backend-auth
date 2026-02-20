// ─── API ────────────────────────────────────────────────────
export { authApi } from "./api/auth.api";
export type {
  LoginCredentials,
  RegisterData,
  AuthSession,
  PasswordResetRequest,
  PasswordResetConfirm,
} from "./api/auth.api.types";

// ─── Query Keys ─────────────────────────────────────────────
export { authQueryKeys } from "./queries/auth.queryKeys";

// ─── Query Options ──────────────────────────────────────────
export {
  authQueries,
  invalidateAuth,
  invalidateAuthSession,
  invalidateAuthProfile,
} from "./queries/auth.queryOptions";

// ─── Query Hooks ────────────────────────────────────────────
export { useSessionQuery } from "./queries/useSession.query";

// ─── Mutation Hooks ─────────────────────────────────────────
export { useLoginMutation } from "./mutations/useLogin.mutation";
export { useRegisterMutation } from "./mutations/useRegister.mutation";
export { useLogoutMutation } from "./mutations/useLogout.mutation";
export { useRefreshTokenMutation } from "./mutations/useRefreshToken.mutation";
export { useDeleteAccountMutation } from "./mutations/useDeleteAccount.mutation";

// ─── Composed Hooks ─────────────────────────────────────────
export { useAuth } from "./hooks/useAuth";
