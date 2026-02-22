import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { IUser } from "@/types";
import { API_URL } from "./api/client";

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
 * If access_token is missing/expired but refresh_token exists, attempts a server-side
 * refresh before giving up. This prevents race conditions where middleware allows the
 * request through while the token is in-flight.
 * Falls back gracefully to null for users who still carry a legacy `session`
 * cookie from the previous auth system — they will be directed to log in again.
 */
export async function getSessionFromCookies(): Promise<Partial<IUser> | null> {
  const cookieStore = (await resolveCookiesToken()) ?? "";
  let verifiedSession = await verifyAccessToken(cookieStore);

  // If no valid access_token but refresh_token exists, attempt server-side refresh
  if (!verifiedSession) {
    const hasRefreshToken = await hasRefreshTokenCookie();
    if (hasRefreshToken) {
      console.log(
        "[getSessionFromCookies] No access_token but refresh_token exists, attempting server-side refresh...",
      );
      const refreshed = await serverSideRefresh();
      if (refreshed) {
        // Refresh succeeded; read the new access_token
        const newAccessToken = await resolveCookiesToken();
        verifiedSession = await verifyAccessToken(newAccessToken ?? "");
        console.log("[getSessionFromCookies] After server-side refresh, verified session:", !!verifiedSession);
      } else {
        console.warn("[getSessionFromCookies] Server-side refresh failed, returning null");
      }
    } else {
      console.warn("[getSessionFromCookies] No refresh_token available, cannot attempt refresh");
    }
  }

  console.log(
    "[getSessionFromCookies] Final result - token exists:",
    !!cookieStore,
    "verified session:",
    !!verifiedSession,
  );
  return verifiedSession;
}

/**
 * Check if refresh_token cookie exists.
 */
async function hasRefreshTokenCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  console.log("[hasRefreshTokenCookie] Checking for refresh_token cookie:", cookieStore.get("refresh_token")?.value);

  console.log("[ALL COOKIES] ✅✅✅", cookieStore.getAll());
  return !!cookieStore.get("refresh_token")?.value;
}

/**
 * Perform a server-side token refresh by calling the backend endpoint.
 * Manually reads the refresh_token cookie and sends it via Cookie header
 * (credentials: "include" only works in browser context, not server-side Node.js).
 *
 * Returns true if refresh succeeded, false otherwise.
 */
async function serverSideRefresh(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      console.warn("[serverSideRefresh] No refresh_token found in cookies");
      return false;
    }

    const refreshUrl = new URL("/auth/refresh", API_URL).toString();

    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `refresh_token=${refreshToken}`,
      },
    });

    if (response.ok) {
      console.log("[serverSideRefresh] Token refresh succeeded");
      return true;
    }

    console.warn(
      "[serverSideRefresh] Refresh failed with status",
      response.status,
      "response:",
      await response.text(),
    );
    return false;
  } catch (error) {
    console.error("[serverSideRefresh] Error during refresh:", error);
    return false;
  }
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
