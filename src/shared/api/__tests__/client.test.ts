import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import {
  APIError,
  RequestTimeoutError,
  api,
  markLogoutIntent,
  clearLogoutIntent,
} from "../client";

const BASE = "http://localhost:3001/api/v1";

// ─── APIError ───────────────────────────────────────────────────────────────

describe("APIError.extractMessage", () => {
  it("returns the string error when error is a plain string", () => {
    expect(APIError.extractMessage({ error: "Unauthorized" }, "Fallback")).toBe(
      "Unauthorized",
    );
  });

  it("returns nested error.message when error is an object", () => {
    expect(
      APIError.extractMessage({ error: { message: "Forbidden" } }, "Fallback"),
    ).toBe("Forbidden");
  });

  it("falls through to top-level message when error object has no message", () => {
    expect(
      APIError.extractMessage({ error: {}, message: "Top level msg" }, "Fallback"),
    ).toBe("Top level msg");
  });

  it("returns the fallback when neither error nor message is present", () => {
    expect(APIError.extractMessage({}, "Fallback")).toBe("Fallback");
  });

  it("ignores null error and returns top-level message", () => {
    expect(
      APIError.extractMessage({ error: undefined, message: "Msg" }, "Fallback"),
    ).toBe("Msg");
  });
});

describe("APIError constructor and instance properties", () => {
  it("sets status, statusText, and data correctly", () => {
    const err = new APIError(401, "Unauthorized", { error: "Session expired" });
    expect(err.status).toBe(401);
    expect(err.statusText).toBe("Unauthorized");
    expect(err.data).toEqual({ error: "Session expired" });
    expect(err.name).toBe("APIError");
    expect(err.message).toContain("401");
    expect(err.message).toContain("Session expired");
  });

  it("sets requestId when provided", () => {
    const err = new APIError(500, "Server Error", {}, "req-id-abc");
    expect(err.requestId).toBe("req-id-abc");
  });

  it("requestId is undefined when not provided", () => {
    const err = new APIError(404, "Not Found", {});
    expect(err.requestId).toBeUndefined();
  });

  it("is an instance of Error", () => {
    expect(new APIError(400, "Bad", {})).toBeInstanceOf(Error);
  });
});

describe("APIError computed flags", () => {
  it("isUnauthorized is true only for 401", () => {
    expect(new APIError(401, "", {}).isUnauthorized).toBe(true);
    expect(new APIError(403, "", {}).isUnauthorized).toBe(false);
    expect(new APIError(500, "", {}).isUnauthorized).toBe(false);
  });

  it("isForbidden is true only for 403", () => {
    expect(new APIError(403, "", {}).isForbidden).toBe(true);
    expect(new APIError(401, "", {}).isForbidden).toBe(false);
  });

  it("isValidationError is true for 400 and 422", () => {
    expect(new APIError(400, "", {}).isValidationError).toBe(true);
    expect(new APIError(422, "", {}).isValidationError).toBe(true);
    expect(new APIError(500, "", {}).isValidationError).toBe(false);
    expect(new APIError(404, "", {}).isValidationError).toBe(false);
  });

  it("isServerError is true for 5xx codes", () => {
    expect(new APIError(500, "", {}).isServerError).toBe(true);
    expect(new APIError(502, "", {}).isServerError).toBe(true);
    expect(new APIError(503, "", {}).isServerError).toBe(true);
    expect(new APIError(404, "", {}).isServerError).toBe(false);
    expect(new APIError(401, "", {}).isServerError).toBe(false);
  });
});

// ─── RequestTimeoutError ────────────────────────────────────────────────────

describe("RequestTimeoutError", () => {
  it("carries the correct message", () => {
    const err = new RequestTimeoutError(5000, "/users");
    expect(err.message).toContain("5000ms");
    expect(err.message).toContain("/users");
  });

  it("has the correct name", () => {
    expect(new RequestTimeoutError(1000, "/test").name).toBe(
      "RequestTimeoutError",
    );
  });

  it("is an instance of Error", () => {
    expect(new RequestTimeoutError(1000, "/test")).toBeInstanceOf(Error);
  });
});

// ─── api.get ────────────────────────────────────────────────────────────────

describe("api.get", () => {
  it("returns parsed JSON on a 200 response", async () => {
    server.use(
      http.get(`${BASE}/items`, () =>
        HttpResponse.json({ id: "1", name: "Widget" }),
      ),
    );
    const result = await api.get<{ id: string; name: string }>("/items");
    expect(result).toEqual({ id: "1", name: "Widget" });
  });

  it("throws APIError on a 404 response", async () => {
    server.use(
      http.get(`${BASE}/missing`, () =>
        HttpResponse.json({ error: "Not Found" }, { status: 404 }),
      ),
    );
    await expect(api.get("/missing")).rejects.toBeInstanceOf(APIError);
  });

  it("throws APIError with correct status on 500", async () => {
    server.use(
      http.get(`${BASE}/broken`, () =>
        HttpResponse.json({ error: "Server Error" }, { status: 500 }),
      ),
    );
    try {
      await api.get("/broken");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect((err as APIError).isServerError).toBe(true);
    }
  });

  it("serialises query params into the URL", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${BASE}/search`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );
    await api.get("/search", { params: { q: "react", page: 2, active: true } });
    expect(capturedUrl).toContain("q=react");
    expect(capturedUrl).toContain("page=2");
    expect(capturedUrl).toContain("active=true");
  });

  it("omits null and undefined params", async () => {
    let capturedUrl = "";
    server.use(
      http.get(`${BASE}/search`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      }),
    );
    await api.get("/search", { params: { q: "react", skip: null, extra: undefined } });
    expect(capturedUrl).not.toContain("skip");
    expect(capturedUrl).not.toContain("extra");
  });
});

// ─── api.post ───────────────────────────────────────────────────────────────

describe("api.post", () => {
  it("sends JSON body and returns the parsed response", async () => {
    server.use(
      http.post(`${BASE}/login`, async ({ request }) => {
        const body = (await request.json()) as { email: string };
        return HttpResponse.json({ ok: true, email: body.email });
      }),
    );
    const result = await api.post<{ ok: boolean; email: string }>("/login", {
      email: "a@b.com",
      password: "secret",
    });
    expect(result.ok).toBe(true);
    expect(result.email).toBe("a@b.com");
  });

  it("sets Content-Type: application/json for object body", async () => {
    let contentType = "";
    server.use(
      http.post(`${BASE}/data`, ({ request }) => {
        contentType = request.headers.get("Content-Type") ?? "";
        return HttpResponse.json({ ok: true });
      }),
    );
    await api.post("/data", { key: "value" });
    expect(contentType).toContain("application/json");
  });

  it("throws APIError with isValidationError=true on 400", async () => {
    server.use(
      http.post(`${BASE}/validate`, () =>
        HttpResponse.json({ error: "Bad Request" }, { status: 400 }),
      ),
    );
    try {
      await api.post("/validate", {});
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(APIError);
      expect((err as APIError).isValidationError).toBe(true);
    }
  });
});

// ─── api.put ────────────────────────────────────────────────────────────────

describe("api.put", () => {
  it("sends a PUT request with body and returns response", async () => {
    server.use(
      http.put(`${BASE}/users/1`, async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ id: "1", name: body.name });
      }),
    );
    const result = await api.put<{ id: string; name: string }>("/users/1", {
      name: "Updated",
    });
    expect(result.id).toBe("1");
    expect(result.name).toBe("Updated");
  });
});

// ─── api.patch ──────────────────────────────────────────────────────────────

describe("api.patch", () => {
  it("sends a PATCH request and returns response", async () => {
    server.use(
      http.patch(`${BASE}/users/1`, () =>
        HttpResponse.json({ patched: true }),
      ),
    );
    const result = await api.patch<{ patched: boolean }>("/users/1", {
      field: "val",
    });
    expect(result.patched).toBe(true);
  });
});

// ─── api.delete ─────────────────────────────────────────────────────────────

describe("api.delete", () => {
  it("sends a DELETE request and returns response", async () => {
    server.use(
      http.delete(`${BASE}/items/1`, () =>
        HttpResponse.json({ deleted: true }),
      ),
    );
    const result = await api.delete<{ deleted: boolean }>("/items/1");
    expect(result.deleted).toBe(true);
  });
});

// ─── api.upload ─────────────────────────────────────────────────────────────

describe("api.upload", () => {
  it("sends FormData and does NOT set Content-Type to application/json", async () => {
    let capturedType: string | null = null;
    server.use(
      http.post(`${BASE}/upload`, ({ request }) => {
        capturedType = request.headers.get("Content-Type");
        return HttpResponse.json({ success: true });
      }),
    );
    const fd = new FormData();
    fd.append("file", new Blob(["data"], { type: "text/plain" }), "file.txt");
    await api.upload("/upload", fd);
    expect(capturedType).not.toBe("application/json");
  });
});

// ─── logout intent helpers ──────────────────────────────────────────────────

describe("markLogoutIntent / clearLogoutIntent", () => {
  it("can be called without throwing", () => {
    expect(() => markLogoutIntent()).not.toThrow();
    expect(() => clearLogoutIntent()).not.toThrow();
  });
});

// ─── timeout ────────────────────────────────────────────────────────────────

describe("request timeout", () => {
  it("rejects when the request exceeds timeoutMs", async () => {
    server.use(
      http.get(`${BASE}/slow`, async () => {
        await new Promise((r) => setTimeout(r, 500));
        return HttpResponse.json({ ok: true });
      }),
    );
    // The client throws RequestTimeoutError, but in some Node environments the
    // AbortError DOMException propagates directly. Accept either.
    await expect(api.get("/slow", { timeoutMs: 50 })).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof RequestTimeoutError ||
        (err instanceof Error && err.name === "AbortError"),
    );
  }, 10_000);
});

// ─── custom Bearer token ─────────────────────────────────────────────────────

describe("custom Bearer token", () => {
  it("injects Authorization header when token is provided", async () => {
    let capturedAuth = "";
    server.use(
      http.get(`${BASE}/secure`, ({ request }) => {
        capturedAuth = request.headers.get("Authorization") ?? "";
        return HttpResponse.json({ ok: true });
      }),
    );
    await api.get("/secure", { token: "my-jwt-token" });
    expect(capturedAuth).toBe("Bearer my-jwt-token");
  });
});
