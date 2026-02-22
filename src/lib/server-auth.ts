import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionFromCookies } from './auth.utils';

// Cached server-side auth check
export const getServerSession = (async () => {
  return await getSessionFromCookies();
});

// Server-side auth guards
export async function requireAuth() {
  const session = await getServerSession();

  if (!session) {
    // If a refresh token exists, allow the page to render and let the
    // client attempt token rotation. Only redirect when no refresh token is present.
    const cookieStore = await cookies();
    if (cookieStore.get('refresh_token')) {
      return null;
    }
    redirect('/login');
  }
  return session;
}

export async function requireOnboarding() {
  const session = await requireAuth();
  if (!session) return null;
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
  if (!session) return null;
  if (!session.emailVerified) {
    redirect('/verify-email');
  }
  return session;
}
