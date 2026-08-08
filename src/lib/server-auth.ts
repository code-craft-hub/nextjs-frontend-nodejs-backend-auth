import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { QueryClient } from "@tanstack/react-query";
import { getSessionFromCookies } from "./auth.utils";
import { userQueries } from "@features/user";
import { APIError } from "@/shared/api/client";

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
    if (cookieStore.get("refresh_token")) {
      return null;
    }
    redirect("/login");
  }
  return session;
}

export async function requireOnboarding() {
  const session = await requireAuth();
  if (!session) return null;
  if (!session.onboardingComplete) {
    redirect("/onboarding");
  }
  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getServerSession();
  if (session) {
    if (!session.onboardingComplete) {
      redirect("/onboarding");
    } else {
      redirect("/dashboard/home");
    }
  }
}

export async function requireEmailVerification() {
  const session = await requireAuth();
  if (!session) return null;
  if (!session.emailVerified) {
    redirect("/verify-email");
  }
  return session;
}

/**
 * Prefetch the current user's profile server-side, treating a 404 as
 * "this account was deleted" rather than a generic page error.
 *
 * Every Server Component that needs userQueries.detail(token) eagerly
 * (i.e. via fetchQuery, which rethrows on failure — unlike prefetchQuery,
 * which swallows errors) must call this instead of fetchQuery directly.
 * Each call site that fetches this query itself is reached independently
 * by Next.js App Router navigation, so the check can't live in one shared
 * layout — every one of them needs this same guard.
 *
 * Safe to call with this specific 404 only: requireAuth()/requireOnboarding()
 * already verify the access token is valid and unexpired before any of these
 * pages render, so a 404 from /users at this point can only mean the JWT's
 * `sub` no longer resolves to a row — never an expired token or a lookup of
 * a different user.
 */
export async function fetchCurrentUserOrLogout(
  queryClient: QueryClient,
  token: string,
): Promise<void> {
  try {
    await queryClient.fetchQuery(userQueries.detail(token));
  } catch (err) {
    if (err instanceof APIError && err.status === 404) {
      redirect("/api/auth/force-logout");
    }
    throw err;
  }
}
