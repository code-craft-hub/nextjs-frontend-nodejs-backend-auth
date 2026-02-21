import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { IUser } from "./src/types";
// import { getJwtSecret } from "./src/lib/utils/helpers";

async function verifySessionToken(
  token: string
): Promise<Partial<IUser> | null> {
  try {
    // const secret = new TextEncoder().encode(getJwtSecret());
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

    // NOTE: no `issuer` option — the backend TokenService does not call
    // .setIssuer(), so enforcing one rejects every valid access token.
    const { payload } = await jwtVerify(token, secret);

    console.log("verifySessionToken payload:", payload);
    // Guard against refresh tokens being used here by design.
    // if (payload["type"] !== "access") return null;

    // New JWT shape (server/modules/auth/services/token.service.ts):
    //   sub              → userId  (JWT standard "subject")
    //   email            → user's email address
    //   emailVerified    → DB-level email verification flag
    //   onboardingComplete → whether the user finished onboarding
    return {
      id: (payload.sub ?? payload["userId"]) as string,
      email: payload["email"] as string,
      emailVerified: payload["emailVerified"] as boolean,
      onboardingComplete: payload["onboardingComplete"] as boolean,
    };
  } catch (err) {
    // Expired / malformed tokens are treated as unauthenticated; no throw.
    console.error("JWT verification failed:", err);
    return null;
  }
}

const publicPaths = ["/login", "/register", "/reset-password"];
const protectedPaths = ["/dashboard"];
const verifyEmailPath = "/verify-email";
const onboardingPath = "/onboarding";

export async function proxy(request: NextRequest) {
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

  // The backend now issues an `access_token` httpOnly cookie (15-min maxAge).
  // The legacy `session` cookie is checked as a fallback so existing browser
  // sessions remain valid during the migration window.
  const sessionToken =
    request.cookies.get("access_token")?.value ??
    request.cookies.get("session")?.value;

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
