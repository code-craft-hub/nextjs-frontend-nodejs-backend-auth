export const ROUTES = {
  // Protected routes that require authentication
  PROTECTED: [
    '/dashboard',
    '/admin'
  ],
  
  // Public routes that don't require authentication
  PUBLIC: [
    '/',
    '/auth',
    '/marketing', 
    '/about',
    '/pricing',
    '/blog',
    '/policy',
    '/terms',
    '/job-listings-landing',
    '/landingpage'
  ],
  
  // Auth-related routes
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
    ONBOARDING: '/auth/onboarding',
    VERIFICATION: '/auth/verification'
  },
  
  // Dashboard routes
  DASHBOARD: {
    HOME: '/dashboard',
    SETTINGS: '/dashboard/settings'
  },
  
  // Marketing routes
  MARKETING: {
    ABOUT: '/marketing/about',
    PRICING: '/marketing/pricing'
  },
  
  // Admin routes
  ADMIN: {
    HOME: '/admin'
  }
} as const

export type RouteType = typeof ROUTES