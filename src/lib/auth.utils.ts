import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { IUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = "nextjs-app";
const JWT_EXPIRY = "7d";

export async function createSessionToken(userSession: IUser): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  return await new SignJWT({ ...userSession })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .setIssuer(JWT_ISSUER)
    .sign(secret);
}

// Verify session token
export async function verifySessionToken(
  token: string
): Promise<Partial<IUser & {customClaims: Record<string, any>}> | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
    });

    return {
      email: payload.email as string,
      emailVerified: payload.emailVerified as boolean,
      onboardingComplete: payload.onboardingComplete as boolean,
      customClaims: payload.customClaims as Record<string, any> | undefined,
      displayName: payload?.displayName as string,
      firstName: payload?.firstName as string,
      lastName: payload?.lastName as string,
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

// Create session cookie
export function setSessionCookie(response: NextResponse, sessionToken: string) {
  response.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Clear session cookie
// export function clearSessionCookie(response: NextResponse) {
//   response.cookies.delete("session");
// }

// Get session from request (for API routes)
export async function getSessionFromRequest(
  request: NextRequest
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
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Reject refresh tokens and any other non-access token types.
    if (payload["type"] !== "access") return null;

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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) return null;
  return verifyAccessToken(accessToken);
}

/**
 * Returns the raw `access_token` JWT for use as a Bearer token in server-side
 * fetch calls that target the Express backend.
 */
export async function getCookiesToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}



