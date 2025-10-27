import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { IUser } from "./types";
import { getJwtSecret } from "./lib/utils/helpers";

async function verifySessionToken(
  token: string
): Promise<Partial<IUser> | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret());
    const { payload } = await jwtVerify(token, secret, {
      issuer: "nextjs-app",
    });

    return {
      uid: payload.uid as string,
      email: payload.email as string,
      emailVerified: payload.emailVerified as boolean,
      onboardingComplete: payload.onboardingComplete as boolean,
      customClaims: payload.customClaims as Record<string, any> | undefined,
      displayName: payload?.displayName as string,
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

const publicPaths = ["/login", "/register"];
const protectedPaths = ["/dashboard/home"];
const verifyEmailPath = "/verify-email";
const onboardingPath = "/onboarding";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("session")?.value;

  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (pathname === "/") {
    return NextResponse.next();
  }

  // Public paths - redirect authenticated users based on their status
  if (publicPaths.includes(pathname)) {
    if (session) {
      // Check email verification first
      // change later: add the ! inside the if condition
      if (!session.emailVerified) {
        return NextResponse.redirect(new URL(verifyEmailPath, request.url));
      }
      // Then check onboarding
      if (!session.onboardingComplete) {
        return NextResponse.redirect(new URL(onboardingPath, request.url));
      }
      // Finally redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard/home", request.url));
    }
    return NextResponse.next();
  }

  // Email verification path
  if (pathname === verifyEmailPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.emailVerified) {
      if (!session.onboardingComplete) {
        return NextResponse.redirect(new URL(onboardingPath, request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/home", request.url));
      }
    }
    return NextResponse.next();
  }

  // Onboarding path
  if (pathname === onboardingPath) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!session.emailVerified) {
      return NextResponse.redirect(new URL(verifyEmailPath, request.url));
    }
    if (session.onboardingComplete) {
      return NextResponse.redirect(new URL("/dashboard/home", request.url));
    }
    return NextResponse.next();
  }

  // Protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!session.emailVerified) {
      return NextResponse.redirect(new URL(verifyEmailPath, request.url));
    }
    if (!session.onboardingComplete) {
      return NextResponse.redirect(new URL(onboardingPath, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
