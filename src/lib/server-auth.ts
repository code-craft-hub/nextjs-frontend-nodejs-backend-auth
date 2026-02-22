import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionFromCookies } from './auth.utils';

// Server-side auth check
// Attempts to get session from cookies; performs server-side refresh if needed.
export async function getServerSession() {
  return await getSessionFromCookies();
}

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
    console.log("[LOGOUT] called in [SERVER-AUTH] requireAuth() because no valid session and no refresh_token present");
    redirect('/login');
  }
  return session;
}

export async function requireOnboarding() {
  const session = await requireAuth();
  if (!session) return null;
  if (!session.onboardingComplete) {
    console.log("[LOGOUT] called in [SERVER-AUTH] requireOnboarding() redirecting to /onboarding");
    redirect('/onboarding');
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getServerSession();
  if (session) {
    if (!session.onboardingComplete) {
      console.log("[LOGOUT] called in [SERVER-AUTH] redirectIfAuthenticated() redirecting to /onboarding");
      redirect('/onboarding');
    } else {
      console.log("[LOGOUT] called in [SERVER-AUTH] redirectIfAuthenticated() redirecting to /dashboard/home");
      redirect('/dashboard/home');
    }
  }
}

export async function requireEmailVerification() {
  const session = await requireAuth();
  if (!session) return null;
  if (!session.emailVerified) {
    console.log("[LOGOUT] called in [SERVER-AUTH] requireEmailVerification() redirecting to /verify-email");
    redirect('/verify-email');
  }
  return session;
}
