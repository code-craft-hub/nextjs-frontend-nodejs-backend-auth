import type { IUser } from "@/shared/types";
import type { AuthSession } from "@/features/auth/api/auth.api.types";

export const mockUser: Partial<IUser> = {
  id: "user-test-123",
  userId: "user-test-123",
  email: "test@example.com",
  displayName: "Test User",
  firstName: "Test",
  lastName: "User",
  emailVerified: true,
  phoneVerified: null,
  accountStatus: "active",
  accountTier: "basic",
  isProUser: false,
  subscriptionTier: null,
  subscriptionStatus: null,
  currentPeriodEnd: null,
  creditBalance: 0,
  locale: "en",
  timezone: "UTC",
  theme: null,
  emailNotifications: true,
  pushNotifications: null,
  smsNotifications: null,
  whatsappNotifications: null,
  profileVisibility: null,
  notificationFrequency: null,
  maxRecommendationsPerDay: null,
  onboardingComplete: false,
  onboardingStep: 0,
  profile: "",
  role: "user",
};

export const mockSession: AuthSession = {
  user: mockUser,
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
};

export const createMockUser = (
  overrides: Partial<IUser> = {},
): Partial<IUser> => ({
  ...mockUser,
  ...overrides,
});

export const createMockSession = (
  overrides: Partial<AuthSession> = {},
): AuthSession => ({
  ...mockSession,
  ...overrides,
});

export const mockAdminUser = createMockUser({ role: "admin", accountTier: "pro", isProUser: true });
export const mockProUser = createMockUser({ accountTier: "pro", isProUser: true, subscriptionTier: "pro" });
