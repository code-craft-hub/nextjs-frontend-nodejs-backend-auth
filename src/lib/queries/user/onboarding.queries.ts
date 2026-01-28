
/**
 * Query key factory for onboarding-related queries
 * Following TanStack Query best practices for key organization
 * 
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */
export const onboardingQueries = {
  // Base key for all onboarding queries
  all: ['onboarding'] as const,
  
  // All status queries
  statuses: () => [...onboardingQueries.all, 'status'] as const,
  
  // Specific status query
  status: () => [...onboardingQueries.statuses(), 'current'] as const,
  
  // Step-specific queries
  steps: () => [...onboardingQueries.all, 'steps'] as const,
  step: (stepNumber: number) => [...onboardingQueries.steps(), stepNumber] as const,
};