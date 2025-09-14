import { verifySessionToken } from "@/lib/auth-utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/"];
const protectedPaths = ["/dashboard"];
const verifyEmailPath = "/verify-email";
const onboardingPath = "/onboarding";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get("session")?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  // Public paths - redirect authenticated users based on their status
  if (publicPaths.includes(pathname)) {
    if (session) {
      // Check email verification first
      if (!session.emailVerified) {
        return NextResponse.redirect(new URL(verifyEmailPath, request.url));
      }
      // Then check onboarding
      if (!session.onboardingComplete) {
        return NextResponse.redirect(new URL(onboardingPath, request.url));
      }
      // Finally redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
        return NextResponse.redirect(new URL("/dashboard", request.url));
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
      return NextResponse.redirect(new URL("/dashboard", request.url));
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

  // Default: allow access
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
