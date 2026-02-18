// ─── API ────────────────────────────────────────────────────
export { userApi } from "./api/user.api";
export type { CreateUserData, UpdateUserData } from "./api/user.api.types";
export {
  updateOnboardingStep,
  getOnboardingStatus,
  type OnboardingUpdatePayload,
  type OnboardingUpdateResponse,
  type OnboardingStep1Data,
  type OnboardingStep2Data,
} from "./api/onboarding.api";

// ─── Query Keys & Options ───────────────────────────────────
export { userQueryKeys } from "./queries/user.queryKeys";
export {
  userQueries,
  invalidateUserLists,
  invalidateUserQueries,
  invalidateUserDetail,
} from "./queries/user.queryOptions";
export { onboardingQueries } from "./queries/onboarding.queryKeys";

// ─── Query Hooks ────────────────────────────────────────────
export { useUserQuery } from "./queries/useUser.query";

// ─── Mutation Hooks ─────────────────────────────────────────
export { useCreateUserMutation } from "./mutations/useCreateUser.mutation";
export { useUpdateUserMutation } from "./mutations/useUpdateUser.mutation";
export { useDeleteUserMutation } from "./mutations/useDeleteUser.mutation";
export {
  useUpdateOnboarding,
  type UseUpdateOnboardingOptions,
} from "./mutations/useUpdateOnboarding.mutation";
