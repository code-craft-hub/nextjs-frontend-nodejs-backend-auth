import { http, HttpResponse } from "msw";
import { mockSession, mockUser } from "../../factories/auth.factory";

const BASE = "http://localhost:3001/api/v1";

export const authHandlers = [
  // Session
  http.get(`${BASE}/session`, () => HttpResponse.json(mockSession)),

  // Profile
  http.get(`${BASE}/users`, () => HttpResponse.json(mockUser)),

  // Login
  http.post(`${BASE}/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "wrong@example.com" || body.password === "wrong") {
      return HttpResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockSession);
  }),

  // Register
  http.post(`${BASE}/register`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };
    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }
    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }
    return HttpResponse.json({
      ...mockSession,
      user: { ...mockSession.user, email: body.email },
    });
  }),

  // Logout
  http.post(`${BASE}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  // Token refresh (used internally by api-client on 401)
  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
  ),

  // Password reset
  http.post(`${BASE}/password-reset`, () => new HttpResponse(null, { status: 204 })),
  http.post(`${BASE}/password-reset/confirm`, () => new HttpResponse(null, { status: 204 })),

  // Change password
  http.put(`${BASE}/auth/change-password`, () => new HttpResponse(null, { status: 204 })),

  // Verification token status
  http.get(`${BASE}/auth/verification-token-status`, () =>
    HttpResponse.json({
      success: true,
      data: { hasActiveToken: false, expiresAt: null },
    }),
  ),
];
