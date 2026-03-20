import React from "react";
import { describe, it, expect, vi } from "vitest";

// Mock Next.js App Router — useLogoutMutation depends on useRouter
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/tests/utils/query-client";
import { useAuth } from "../hooks/useAuth";
import { mockSession } from "@/tests/factories/auth.factory";

const BASE = "http://localhost:3001/api/v1";

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── session state ───────────────────────────────────────────────────────────

describe("useAuth — session state", () => {
  it("returns isAuthenticated=false and user=null when no session exists", async () => {
    server.use(
      http.get(`${BASE}/session`, () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("returns the user and isAuthenticated=true when a session exists", async () => {
    server.use(
      http.get(`${BASE}/session`, () => HttpResponse.json(mockSession)),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({
      id: mockSession.user.id,
      email: mockSession.user.email,
    });
    expect(result.current.session?.expiresAt).toBe(mockSession.expiresAt);
  });

  it("exposes isError=true when the session query fails with a server error", async () => {
    server.use(
      http.get(`${BASE}/session`, () =>
        HttpResponse.json({ error: "Server Error" }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isError).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });
});

// ─── actions ─────────────────────────────────────────────────────────────────

describe("useAuth — action functions", () => {
  it("exposes login, logout, and register as functions", () => {
    server.use(
      http.get(`${BASE}/session`, () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(typeof result.current.register).toBe("function");
  });
});

// ─── pending states ───────────────────────────────────────────────────────────

describe("useAuth — isLoggingIn", () => {
  it("tracks isPending state during login", async () => {
    let resolveLogin!: () => void;
    const blocker = new Promise<void>((r) => {
      resolveLogin = r;
    });

    server.use(
      http.get(`${BASE}/session`, () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ),
      http.post(`${BASE}/login`, async () => {
        await blocker;
        return HttpResponse.json(mockSession);
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for initial load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isLoggingIn).toBe(false);

    // Trigger login without awaiting
    result.current.login({ email: "test@example.com", password: "pass123" });

    await waitFor(() => expect(result.current.isLoggingIn).toBe(true));

    resolveLogin();

    await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
  });
});

describe("useAuth — isRegistering", () => {
  it("tracks isPending state during registration", async () => {
    let resolveRegister!: () => void;
    const blocker = new Promise<void>((r) => {
      resolveRegister = r;
    });

    server.use(
      http.get(`${BASE}/session`, () =>
        HttpResponse.json({ error: "Unauthorized" }, { status: 401 }),
      ),
      http.post(`${BASE}/register`, async () => {
        await blocker;
        return HttpResponse.json(mockSession);
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isRegistering).toBe(false);

    result.current.register({
      email: "new@example.com",
      password: "pass123",
      name: "New User",
    });

    await waitFor(() => expect(result.current.isRegistering).toBe(true));

    resolveRegister();

    await waitFor(() => expect(result.current.isRegistering).toBe(false));
  });
});

describe("useAuth — isLoggingOut", () => {
  it("tracks isPending state during logout", async () => {
    let resolveLogout!: () => void;
    const blocker = new Promise<void>((r) => {
      resolveLogout = r;
    });

    server.use(
      http.get(`${BASE}/session`, () => HttpResponse.json(mockSession)),
      http.post(`${BASE}/auth/logout`, async () => {
        await blocker;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isLoggingOut).toBe(false);

    result.current.logout();

    await waitFor(() => expect(result.current.isLoggingOut).toBe(true));

    resolveLogout();

    await waitFor(() => expect(result.current.isLoggingOut).toBe(false));
  });
});
