import { requireAuth } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import VerifyEmailClient from './verify-email-client';

export default async function VerifyEmailPage() {
  const session = await requireAuth();
  
  // Redirect if email already verified
  if (session.emailVerified) {
    if (!session.onboardingComplete) {
      redirect('/onboarding');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <VerifyEmailClient 
      initialUser={{
        uid: session.uid,
        email: session.email,
        emailVerified: session.emailVerified,
        onboardingComplete: session.onboardingComplete,
      }}
    />
  );
}