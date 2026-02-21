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
 * Reads the `access_token` httpOnly cookie set by the Express backend on login.
 * Falls back gracefully to null for users who still carry a legacy `session`
 * cookie from the previous auth system — they will be directed to log in again.
 */
export async function getSessionFromCookies(): Promise<Partial<IUser> | null> {
  const cookieStore = (await resolveCookiesToken()) ?? "";
  const verifiedSession = await verifyAccessToken(cookieStore);
  console.log(
    "getSessionFromCookies token:",
    cookieStore,
    "verify result:",
    verifiedSession,
  );
  return verifiedSession;
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
    console.log("Found access_token cookie");
    cookieValue = cookieStore.get("access_token")?.value;
  } else if (cookieStore.get("session")?.value) {
    console.log("Found legacy session cookie");
    cookieValue = cookieStore.get("session")?.value;
  }

  return cookieValue ?? null;
}
