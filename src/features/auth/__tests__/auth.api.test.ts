import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { authApi } from "../api/auth.api";
import { APIError } from "@/shared/api/client";
import { mockSession, mockUser } from "@/tests/factories/auth.factory";

const BASE = "http://localhost:3001/api/v1";

// ─── getSession ─────────────────────────────────────────────────────────────

describe("authApi.getSession", () => {
  it("returns the session on success", async () => {
    server.use(
      http.get(`${BASE}/session`, () => HttpResponse.json(mockSession)),
    );
    const session = await authApi.getSession();
    expect(session.user).toMatchObject({ id: mockUser.id });
    expect(session.expiresAt).toBeTruthy();
  });

  it("throws APIError on 401", async () => {
    server.use(
      http.get(`${BASE}/session`, () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ),
    );
    await expect(authApi.getSession()).rejects.toBeInstanceOf(APIError);
  });

  it("throws APIError on 500", async () => {
    server.use(
      http.get(`${BASE}/session`, () =>
        HttpResponse.json({ error: "Internal Server Error" }, { status: 500 }),
      ),
    );
    try {
      await authApi.getSession();
      expect.fail("should have thrown");
    } catch (err) {
      expect((err as APIError).isServerError).toBe(true);
    }
  });
});

// ─── getProfile ─────────────────────────────────────────────────────────────

describe("authApi.getProfile", () => {
  it("returns the user profile on success", async () => {
    server.use(http.get(`${BASE}/users`, () => HttpResponse.json(mockUser)));
    const profile = await authApi.getProfile();
    expect(profile).toMatchObject({ id: mockUser.id, email: mockUser.email });
  });

  it("throws APIError on 404", async () => {
    server.use(
      http.get(`${BASE}/users`, () =>
        HttpResponse.json({ error: "Not Found" }, { status: 404 }),
      ),
    );
    await expect(authApi.getProfile()).rejects.toBeInstanceOf(APIError);
  });
});

// ─── login ──────────────────────────────────────────────────────────────────

describe("authApi.login", () => {
  it("returns an AuthSession on valid credentials", async () => {
    server.use(
      http.post(`${BASE}/login`, () => HttpResponse.json(mockSession)),
    );
    const session = await authApi.login({
      email: "test@example.com",
      password: "password123",
    });
    expect(session.user).toBeDefined();
    expect(session.expiresAt).toBeDefined();
  });

  it("throws APIError with isUnauthorized=true on wrong credentials", async () => {
    server.use(
      http.post(`${BASE}/login`, () =>
        HttpResponse.json({ error: "Invalid credentials" }, { status: 401 }),
      ),
    );
    try {
      await authApi.login({ email: "wrong@example.com", password: "wrong" });
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect((err as APIError).isUnauthorized).toBe(true);
    }
  });

  it("throws APIError with isValidationError=true on missing fields", async () => {
    server.use(
      http.post(`${BASE}/login`, () =>
        HttpResponse.json({ error: "Validation failed" }, { status: 422 }),
      ),
    );
    try {
      await authApi.login({ email: "", password: "" });
      expect.fail("should have thrown");
    } catch (err) {
      expect((err as APIError).isValidationError).toBe(true);
    }
  });
});

// ─── register ───────────────────────────────────────────────────────────────

describe("authApi.register", () => {
  it("returns a session after successful registration", async () => {
    server.use(
      http.post(`${BASE}/register`, () => HttpResponse.json(mockSession)),
    );
    const session = await authApi.register({
      email: "new@example.com",
      password: "securePass123",
      name: "New User",
    });
    expect(session.user).toBeDefined();
  });

  it("throws APIError on duplicate email (409)", async () => {
    server.use(
      http.post(`${BASE}/register`, () =>
        HttpResponse.json({ error: "Email already in use" }, { status: 409 }),
      ),
    );
    await expect(
      authApi.register({
        email: "existing@example.com",
        password: "pass123",
        name: "User",
      }),
    ).rejects.toBeInstanceOf(APIError);
  });
});

// ─── logout ─────────────────────────────────────────────────────────────────

describe("authApi.logout", () => {
  it("resolves without throwing on 204", async () => {
    server.use(
      http.post(`${BASE}/auth/logout`, () => new HttpResponse(null, { status: 204 })),
    );
    await expect(authApi.logout()).resolves.not.toThrow();
  });

  it("throws on server error", async () => {
    server.use(
      http.post(`${BASE}/auth/logout`, () =>
        HttpResponse.json({ error: "Server Error" }, { status: 500 }),
      ),
    );
    await expect(authApi.logout()).rejects.toBeInstanceOf(APIError);
  });
});

// ─── requestPasswordReset ───────────────────────────────────────────────────

describe("authApi.requestPasswordReset", () => {
  it("resolves on success", async () => {
    server.use(
      http.post(`${BASE}/password-reset`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );
    await expect(
      authApi.requestPasswordReset({ email: "user@example.com" }),
    ).resolves.not.toThrow();
  });
});

// ─── resetPassword ──────────────────────────────────────────────────────────

describe("authApi.resetPassword", () => {
  it("resolves on success", async () => {
    server.use(
      http.post(`${BASE}/password-reset/confirm`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );
    await expect(
      authApi.resetPassword({ token: "reset-token", newPassword: "newPass123" }),
    ).resolves.not.toThrow();
  });

  it("throws APIError on expired token (400)", async () => {
    server.use(
      http.post(`${BASE}/password-reset/confirm`, () =>
        HttpResponse.json({ error: "Token expired" }, { status: 400 }),
      ),
    );
    await expect(
      authApi.resetPassword({ token: "expired", newPassword: "new" }),
    ).rejects.toBeInstanceOf(APIError);
  });
});

// ─── changePassword ─────────────────────────────────────────────────────────

describe("authApi.changePassword", () => {
  it("resolves on success", async () => {
    server.use(
      http.put(`${BASE}/auth/change-password`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );
    await expect(
      authApi.changePassword({ currentPassword: "old123", newPassword: "new456" }),
    ).resolves.not.toThrow();
  });

  it("supports omitting currentPassword (Google accounts)", async () => {
    server.use(
      http.put(`${BASE}/auth/change-password`, () =>
        new HttpResponse(null, { status: 204 }),
      ),
    );
    await expect(
      authApi.changePassword({ newPassword: "brand-new-pass" }),
    ).resolves.not.toThrow();
  });
});

// ─── getVerificationTokenStatus ─────────────────────────────────────────────

describe("authApi.getVerificationTokenStatus", () => {
  it("returns the token status on success", async () => {
    server.use(
      http.get(`${BASE}/auth/verification-token-status`, () =>
        HttpResponse.json({
          success: true,
          data: { hasActiveToken: true, expiresAt: "2026-03-25T00:00:00Z" },
        }),
      ),
    );
    const status = await authApi.getVerificationTokenStatus();
    expect(status.hasActiveToken).toBe(true);
    expect(status.expiresAt).toBeTruthy();
  });

  it("throws when success=false", async () => {
    server.use(
      http.get(`${BASE}/auth/verification-token-status`, () =>
        HttpResponse.json({ success: false }),
      ),
    );
    await expect(authApi.getVerificationTokenStatus()).rejects.toThrow();
  });
});
