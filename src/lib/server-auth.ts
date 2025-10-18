import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getSessionFromCookies } from './auth.utils';

// Cached server-side auth check
export const getServerSession = cache(async () => {
  return await getSessionFromCookies();
});

// Server-side auth guards
export async function requireAuth() {
  const session = await getServerSession();

  console.log("Session in requireAuth:", session); // Debugging line
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireOnboarding() {
  const session = await requireAuth();
  if (!session.onboardingComplete) {
    redirect('/onboarding');
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getServerSession();
  if (session) {
    if (!session.onboardingComplete) {
      redirect('/onboarding');
    } else {
      redirect('/dashboard/home');
    }
  }
}

export async function requireEmailVerification() {
  const session = await requireAuth();
  if (!session.emailVerified) {
    redirect('/verify-email');
  }
  return session;
}
