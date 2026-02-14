const isClientSide = typeof window !== "undefined";
const isDevelopment = process.env.NODE_ENV === "development";

export const BACKEND_API_VERSION = "v1";

export const BASEURL =
isClientSide && isDevelopment ? "/api" : process.env.NEXT_PUBLIC_AUTH_API_URL;

export const API_URL = `${BASEURL}/${BACKEND_API_VERSION}`

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "APIError";
  }
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, params, ...fetchOptions } = options;

  let url: URL;

  // Handle absolute vs relative baseURL
  if (BASEURL?.startsWith("http")) {
    url = new URL(`${BASEURL}${endpoint}`);
  } else {
    // Relative URL: must use window.location.origin on client
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost";
    url = new URL(`${BASEURL}${endpoint}`, origin);
  }

  // Append params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  const isServerSide = typeof window === "undefined";

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    credentials: isServerSide ? "omit" : "include", // Important distinction
  });

  const data = await response.json().catch(() => ({ error: "Request failed" }));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.reload();
    }
    throw new APIError(response.status, data.error || "Request failed", data);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
