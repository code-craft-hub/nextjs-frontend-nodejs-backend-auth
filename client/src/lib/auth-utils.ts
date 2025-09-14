// lib/auth-utils.ts
import { adminAuth } from "./firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface UserSession {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
  customClaims?: Record<string, any>;
}

// Create secure session token (not Firebase token)
export async function createSessionToken(
  userSession: UserSession
): Promise<string> {
  return jwt.sign(userSession, process.env.JWT_SECRET!, {
    expiresIn: "7d",
    issuer: "nextjs-app",
  });
}

// Verify session token
export async function verifySessionToken(
  token: string
): Promise<UserSession | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserSession;
    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.emailVerified,
      onboardingComplete: decoded.onboardingComplete,
      customClaims: decoded.customClaims,
    };
  } catch {
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
export function clearSessionCookie(response: NextResponse) {
  response.cookies.delete("session");
}

// Get session from request (for API routes)
export async function getSessionFromRequest(
  request: NextRequest
): Promise<UserSession | null> {
  const sessionToken = request.cookies.get("session")?.value;
  if (!sessionToken) return null;
  return verifySessionToken(sessionToken);
}

// Get session from cookies (for server components)
export async function getSessionFromCookies(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;
  return verifySessionToken(sessionToken);
}

// Verify Firebase ID token and create user session
export async function verifyFirebaseToken(
  idToken: string
): Promise<UserSession> {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const user = await adminAuth.getUser(decodedToken.uid);

  return {
    uid: user.uid,
    email: user.email!,
    emailVerified: user.emailVerified,
    onboardingComplete: user.customClaims?.onboardingComplete || false,
    customClaims: user.customClaims,
  };
}

// Update user custom claims
export async function updateUserClaims(
  uid: string,
  claims: Record<string, any>
) {
  await adminAuth.setCustomUserClaims(uid, claims);
}

// Sign in with password using Firebase REST API
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



// Mark email as verified in Firebase
export async function markEmailAsVerified(uid: string) {
  await adminAuth.updateUser(uid, {
    emailVerified: true,
  });
}
