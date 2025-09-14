'use client';

import { useAuth } from '@/hooks/use-auth';

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

interface OnboardingClientProps {
  initialUser: User;
}

export default function OnboardingClient({ initialUser }: OnboardingClientProps) {
  const { completeOnboarding, isOnboardingLoading, user } = useAuth();

  const currentUser = user || initialUser;

  const handleComplete = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  return (
    <div>
      <h1>Welcome, {currentUser.email}!</h1>
      <p>Complete your onboarding to access the dashboard.</p>
      <button onClick={handleComplete} disabled={isOnboardingLoading}>
        {isOnboardingLoading ? 'Completing...' : 'Complete Onboarding'}
      </button>
    </div>
  );
}