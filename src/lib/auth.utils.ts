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
): Promise<Partial<IUser> | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
    });

    return {
      uid: payload.uid as string,
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

// Get session from cookies (for server components)
export async function getSessionFromCookies(): Promise<Partial<IUser> | null> {
  const cookieStore = await cookies();
  console.log("Cookies available:", cookieStore.getAll()); // Debugging line
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;
  return verifySessionToken(sessionToken);
}



export async function signInWithPassword(email: string, password: string) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Sign in failed");
  }

  return response.json();
}
