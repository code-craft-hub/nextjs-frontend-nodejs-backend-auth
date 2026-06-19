import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/shared/api/client";

// Clears the session and redirects to /login in a single hop.
//
// Why this exists:
//   Server Components (e.g. dashboard/layout.tsx) can detect "this user no
//   longer exists" (a 404 from /users with a still-valid access token) but
//   cannot write Set-Cookie themselves — only a Route Handler can. A bare
//   redirect("/login") would leave the valid access_token cookie in place,
//   and proxy.ts would see it and immediately bounce /login back to
//   /dashboard, recreating the same 404 in a loop.
//
//   This handler forwards the browser's cookies to the real backend logout
//   endpoint (which clears the session and returns Set-Cookie headers that
//   expire both cookies), attaches those headers to its own redirect, and
//   sends the browser to /login already logged out.
//
// API_URL is reused from the api-client rather than re-derived here so this
// stays correct under whatever next.config.ts's rewrites() does (dev →
// 127.0.0.1:8080, prod → NEXT_PUBLIC_AUTH_API_URL) without duplicating that
// resolution logic — including its fail-fast throw if the env var is
// missing in a server context.

const LOGOUT_URL = `${API_URL}/auth/logout`;

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";

  let backendRes: Response | undefined;
  try {
    backendRes = await fetch(LOGOUT_URL, {
      method: "POST",
      headers: cookie ? { Cookie: cookie } : {},
    });
  } catch (err) {
    console.error("[force-logout] backend logout call failed:", err);
  }

  const response = NextResponse.redirect(new URL("/login", req.url));

  const setCookies = backendRes?.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    response.headers.append("Set-Cookie", c);
  }

  return response;
}
