/**
 * @file api-client.ts
 * @description Production-grade, type-safe HTTP client for Next.js (App Router compatible).
 *
 * Features:
 *  - Environment-aware base URL resolution with strict validation
 *  - Serialised token refresh via a proper mutex (no double-refresh storms)
 *  - Per-request AbortController with configurable timeout
 *  - Safe redirect after session expiry (no mid-flight side-effects)
 *  - Content-Type auto-detection (JSON / FormData / URLSearchParams)
 *  - Fully typed errors with discriminated union support
 *  - Zero external dependencies
 */

// ─── Environment Resolution ──────────────────────────────────────────────────

const IS_CLIENT = typeof window !== "undefined";
const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Resolves the base URL with strict validation to prevent silent misconfiguration.
 *
 * Rules:
 *  - Client + Dev  → relative "/api" so Next.js rewrites proxy to the backend
 *  - All other cases → absolute URL from NEXT_PUBLIC_AUTH_API_URL
 *
 * Throws at module initialisation in server environments if the env var is
 * missing so the deployment fails fast rather than silently hitting localhost.
 */
function resolveBaseUrl(): string {
  if (IS_CLIENT && IS_DEV) {
    // Dev client: rely on next.config rewrites to forward /api → backend
    return "/api";
  }

  const envUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;

  if (!envUrl) {
    const message =
      "[api-client] NEXT_PUBLIC_AUTH_API_URL is not set. " +
      "All API requests will fail. Set this variable in your environment.";

    // In server/build contexts throw hard so CI catches the misconfiguration.
    // In client production we log loudly instead of crashing the app shell.
    if (!IS_CLIENT) throw new Error(message);
    console.error(message);
    return ""; // Will produce a clear fetch error rather than hitting localhost.
  }

  return envUrl;
}

export const BACKEND_API_VERSION = "v1" as const;
export const BASEURL = resolveBaseUrl();
export const API_URL = `${BASEURL}/${BACKEND_API_VERSION}` as const;

// ─── Error Types ─────────────────────────────────────────────────────────────

/** Structured shape returned by the backend on error responses. */
export interface ApiErrorPayload {
  error?: string;
  message?: string;
  code?: string;
  details?: unknown;
}

export class APIError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: ApiErrorPayload;
  public readonly requestId?: string;

  constructor(
    status: number,
    statusText: string,
    data: ApiErrorPayload,
    requestId?: string,
  ) {
    super(`APIError ${status}: ${data.error ?? data.message ?? statusText}`);
    this.name = "APIError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.requestId = requestId;

    // Maintain proper prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** True when the error represents an authentication failure. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True when the error represents a permission failure. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True when the error represents a validation failure. */
  get isValidationError(): boolean {
    return this.status === 422 || this.status === 400;
  }

  /** True when the error originates from server infrastructure. */
  get isServerError(): boolean {
    return this.status >= 500;
  }
}

/** Thrown when a request exceeds the configured timeout. */
export class RequestTimeoutError extends Error {
  constructor(timeoutMs: number, endpoint: string) {
    super(
      `Request to "${endpoint}" timed out after ${timeoutMs}ms`,
    );
    this.name = "RequestTimeoutError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Request Options ─────────────────────────────────────────────────────────

export interface FetchOptions extends Omit<RequestInit, "body"> {
  /** Typed query string parameters — serialised automatically. */
  params?: Record<string, string | number | boolean | null | undefined>;

  /**
   * Explicit Bearer token. When omitted the client relies on the
   * httpOnly access_token cookie sent automatically via credentials:"include".
   */
  token?: string;

  /**
   * Request body. Supports:
   *  - Plain objects / arrays → serialised as JSON
   *  - FormData              → sent as-is (browser sets boundary)
   *  - URLSearchParams       → sent as application/x-www-form-urlencoded
   *  - string / null         → sent as-is
   */
  body?: unknown;

  /**
   * Abort the request after this many milliseconds.
   * Defaults to DEFAULT_TIMEOUT_MS. Pass 0 to disable.
   */
  timeoutMs?: number;

  /**
   * When true, a 401 will NOT trigger the token-refresh flow.
   * Set this for the refresh endpoint itself to prevent loops.
   */
  skipRefresh?: boolean;
}

// ─── Token Refresh Mutex ─────────────────────────────────────────────────────

/**
 * A simple promise-based mutex that ensures only one refresh request
 * is in-flight at any time. All concurrent callers await the same promise.
 *
 * The promise is nulled out ONLY after all microtask continuations have
 * had a chance to subscribe, avoiding the window where `refreshPromise`
 * is null but `isRefreshing` is still logically true.
 */
const refreshMutex = (() => {
  let activePromise: Promise<boolean> | null = null;

  return {
    acquire(task: () => Promise<boolean>): Promise<boolean> {
      if (activePromise) return activePromise;

      activePromise = task().finally(() => {
        // Use a microtask tick so any concurrent awaits already queued on
        // `activePromise` resolve BEFORE we clear the reference.
        // This prevents a second refresh storm.
        queueMicrotask(() => {
          activePromise = null;
        });
      });

      return activePromise;
    },
  };
})();

/**
 * POST to the refresh endpoint. The httpOnly `refresh_token` cookie is
 * sent automatically by the browser because credentials:"include" is set
 * and the cookie path matches "/api/v1/auth".
 */
async function refreshAccessToken(): Promise<boolean> {
  return refreshMutex.acquire(async () => {
    try {
      const refreshUrl = buildUrl("/auth/refresh");

      const response = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
      });

      return response.ok;
    } catch {
      return false;
    }
  });
}

// ─── URL Builder ─────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 60_000; // 60 s

/**
 * Constructs a fully-qualified URL from an endpoint path.
 * Handles both absolute (https://…) and relative (/api) base URLs safely
 * WITHOUT falling back to localhost.
 */
function buildUrl(endpoint: string, params?: FetchOptions["params"]): string {
  let url: URL;

  const fullPath = `${BASEURL}/${BACKEND_API_VERSION}${endpoint}`;

  if (BASEURL.startsWith("http://") || BASEURL.startsWith("https://")) {
    url = new URL(fullPath);
  } else if (IS_CLIENT) {
    // Relative base URL — safe because we are in a browser context.
    url = new URL(fullPath, window.location.origin);
  } else {
    // Server-side with a relative base is a misconfiguration.
    // Produce a descriptive error rather than silently pointing at localhost.
    throw new Error(
      `[api-client] Cannot build absolute URL server-side from relative BASEURL "${BASEURL}". ` +
        `Ensure NEXT_PUBLIC_AUTH_API_URL is set to an absolute URL.`,
    );
  }

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

// ─── Header Builder ───────────────────────────────────────────────────────────

/**
 * Constructs request headers. Deliberately skips Content-Type for FormData
 * and URLSearchParams so the browser/runtime can set the correct boundary.
 */
function buildHeaders(
  body: unknown,
  token?: string,
  extraHeaders?: HeadersInit,
): HeadersInit {
  const headers: Record<string, string> = {};

  // Only set Content-Type for JSON-serialisable bodies.
  if (
    body !== undefined &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    typeof body !== "string"
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Allow caller overrides (e.g. custom Content-Type, tracing headers)
  if (extraHeaders) {
    const entries =
      extraHeaders instanceof Headers
        ? Array.from(extraHeaders.entries())
        : Object.entries(extraHeaders as Record<string, string>);

    for (const [k, v] of entries) {
      headers[k] = v;
    }
  }

  return headers;
}

// ─── Body Serialiser ──────────────────────────────────────────────────────────

function serialiseBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    typeof body === "string"
  ) {
    return body as BodyInit;
  }
  return JSON.stringify(body);
}

// ─── Response Parser ──────────────────────────────────────────────────────────

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  if (contentType.includes("text/")) {
    return response.text() as unknown as T;
  }

  // Binary (blob, stream, etc.)
  return response.blob() as unknown as T;
}

// ─── Core Fetch Client ────────────────────────────────────────────────────────

/**
 * Core fetch wrapper. Handles:
 *  - Typed query params
 *  - Automatic JSON / FormData / URLSearchParams body serialisation
 *  - Bearer token injection
 *  - Request timeout via AbortController
 *  - Transparent 401 → token refresh → single retry
 *  - Safe post-session-expiry redirect (after error propagation)
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
  _isRetry = false,
): Promise<T> {
  const {
    token,
    params,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    skipRefresh = false,
    headers: extraHeaders,
    ...restOptions
  } = options;

  // ── Timeout ─────────────────────────────────────────────────────────────
  const controller = new AbortController();
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  if (timeoutMs > 0) {
    timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const url = buildUrl(endpoint, params);
    const serialisedBody = serialiseBody(body);
    const headers = buildHeaders(body, token, extraHeaders);

    const response = await fetch(url, {
      ...restOptions,
      headers,
      body: serialisedBody,
      signal: controller.signal,
      // Never send cookies in server-side renders — httpOnly cookies are
      // session-bound to the browser. On the server, use explicit tokens.
      credentials: IS_CLIENT ? "include" : "omit",
    });

    // ── Success Path ─────────────────────────────────────────────────────
    if (response.ok) {
      return parseResponse<T>(response);
    }

    // ── Error Path ───────────────────────────────────────────────────────
    let errorData: ApiErrorPayload = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText || "Request failed" };
    }

    const requestId = response.headers.get("X-Request-Id") ?? undefined;

    // ── 401 Recovery ─────────────────────────────────────────────────────
    if (
      response.status === 401 &&
      IS_CLIENT &&
      !_isRetry &&
      !skipRefresh
    ) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        // New access_token cookie is now in the jar — retry once.
        return apiClient<T>(endpoint, options, true);
      }

      // Refresh failed → session fully expired.
      // Throw first so any catch blocks can react (clear stores, show modal),
      // then redirect on the next tick so navigation is never mid-throw.
      const error = new APIError(
        response.status,
        response.statusText,
        errorData,
        requestId,
      );

      queueMicrotask(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      });

      throw error;
    }

    throw new APIError(
      response.status,
      response.statusText,
      errorData,
      requestId,
    );
  } catch (error) {
    if (error instanceof APIError) throw error;

    // AbortController fired → rethrow as a descriptive timeout error
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RequestTimeoutError(timeoutMs, endpoint);
    }

    // Network-level failure (DNS, connection refused, etc.)
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

// ─── Type-safe Convenience Methods ───────────────────────────────────────────

export const api = {
  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "GET" });
  },

  post<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "POST", body: data });
  },

  put<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "PUT", body: data });
  },

  patch<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions,
  ): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "PATCH", body: data });
  },

  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return apiClient<T>(endpoint, { ...options, method: "DELETE" });
  },

  /**
   * Upload a file or form payload. Accepts FormData or URLSearchParams.
   * Content-Type is intentionally NOT set so the browser adds the multipart
   * boundary automatically.
   */
  upload<T>(
    endpoint: string,
    formData: FormData | URLSearchParams,
    options?: FetchOptions,
  ): Promise<T> {
    return apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  },
} as const;