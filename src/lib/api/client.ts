export const baseURL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080/api";

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "APIError";
  }
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  console.log(
    "🔍 apiClient called with endpoint:",
    endpoint,
    "with token:",
    token
  );

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };


  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
    console.log("📤 Server request: Authorization header added");
  }

  const isClientSide = typeof window !== "undefined";
  const credentials: RequestCredentials = isClientSide ? "include" : "omit";

  console.log(`📡 Request: ${endpoint}`, {
    environment: isClientSide ? "Client" : "Server",
    hasToken: !!token,
    credentials,
    willSendCookies: credentials === "include",
    willSendHeader: !!token,
    headers
  });

  const response = await fetch(
    `${baseURL}${endpoint}`,
    {
      ...fetchOptions,
      headers,
      credentials,
    }
  );

  console.log(
    `📥 Response: ${endpoint} - Status ${response.status}`,
    response,
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new APIError(response.status, error.error || "Request failed", error);
  }

  return response.json();
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
