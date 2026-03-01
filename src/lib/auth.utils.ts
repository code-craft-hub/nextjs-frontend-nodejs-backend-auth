import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { IUser } from "@/types";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

// Verify session token
export async function verifySessionToken(
  token: string,
): Promise<Partial<IUser & { customClaims: Record<string, any> }> | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secret);

    return {
      email: payload.email as string,
      emailVerified: payload.emailVerified as boolean,
      onboardingComplete: payload.onboardingComplete as boolean,
      customClaims: payload.customClaims as Record<string, any> | undefined,
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

// Get session from request (for API routes)
export async function getSessionFromRequest(
  request: NextRequest,
): Promise<Partial<IUser> | null> {
  const sessionToken = request.cookies.get("session")?.value;
  if (!sessionToken) return null;
  return verifySessionToken(sessionToken);
}

/**
 * Verify a token issued by the Express backend (new auth system).
 *
 * The backend signs access tokens with HS256 using JWT_SECRET. There is no
 * issuer constraint — the token type claim ("access") is checked instead to
 * guard against accidentally accepting refresh tokens.
 *
 * Returns null (never throws) so callers can treat any failure as unauthenticated.
 */
async function verifyAccessToken(
  token: string,
): Promise<Partial<IUser> | null> {
  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Reject refresh tokens and any other non-access token types.
    // if (payload["type"] !== "access") return null;

    return {
      email: payload.email as string,
      emailVerified: payload.emailVerified as boolean,
      onboardingComplete: payload.onboardingComplete as boolean,
    };
  } catch {
    // Expired, wrong signature, malformed — all treated as unauthenticated.
    return null;
  }
}

/**
 * Get session from cookies (for server components).
 *
 * Reads the `access_token` httpOnly cookie set by the Express backend on login
 * and verifies it locally. Returns the decoded session on success, null otherwise.
 *
 * Intentionally does NOT attempt a server-side token refresh here. Refresh tokens
 * are rotating (one-time-use): consuming one from a Server Component would
 * invalidate it without being able to forward the new Set-Cookie headers to the
 * browser (cookies().set() is unavailable in Server Components). This would leave
 * the client holding an already-invalidated refresh token, causing a full logout.
 *
 * The correct recovery path when this returns null is:
 *  1. requireAuth() checks for a refresh_token cookie — if present it returns null
 *     instead of redirecting, allowing the page to render.
 *  2. Client-side apiClient receives a 401, calls refreshAccessToken(), and retries.
 *     The browser automatically includes the refresh_token cookie in that request
 *     because credentials:"include" is set and the cookie path is now "/".
 */
export async function getSessionFromCookies(): Promise<Partial<IUser> | null> {
  const accessToken = await resolveCookiesToken();
  return verifyAccessToken(accessToken ?? "");
}

/**
 * Returns the raw `access_token` JWT for use as a Bearer token in server-side
 * fetch calls that target the Express backend.
 */
export async function getCookiesToken(): Promise<string | null> {
  return await resolveCookiesToken();
}

async function resolveCookiesToken(): Promise<string | null> {
  const cookieStore = await cookies();

  let cookieValue = null;
  if (cookieStore.get("access_token")?.value) {
    cookieValue = cookieStore.get("access_token")?.value;
  } else if (cookieStore.get("session")?.value) {
    cookieValue = cookieStore.get("session")?.value;
  }

  return cookieValue ?? null;
}
