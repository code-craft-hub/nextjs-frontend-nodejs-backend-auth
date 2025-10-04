export const ROUTES = {
  // Protected routes that require authentication
  PROTECTED: ["/dashboard/home", "/admin"],

  // Public routes that don't require authentication
  PUBLIC: [
    "/",
    "/auth",
    "/marketing",
    "/about",
    "/pricing",
    "/blog",
    "/policy",
    "/terms",
    "/job-listings-landing",
    "/landingpage",
  ],

  // Auth-related routes
  AUTH: {
    SIGN_IN: "/login",
    SIGN_UP: "/auth/sign-up",
    ONBOARDING: "/auth/onboarding",
    VERIFICATION: "/auth/verification",
  },

  // Dashboard routes
  DASHBOARD: {
    HOME: "/dashboard/home",
    SETTINGS: "/dashboard/settings",
  },

  // Marketing routes
  MARKETING: {
    ABOUT: "/marketing/about",
    PRICING: "/marketing/pricing",
  },

  // Admin routes
  ADMIN: {
    HOME: "/admin",
  },
} as const;

export type RouteType = typeof ROUTES;
