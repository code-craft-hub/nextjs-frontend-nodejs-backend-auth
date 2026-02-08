const isClientSide = typeof window !== "undefined";
const isDevelopment = process.env.NODE_ENV === "development";
export const baseURL =
  isClientSide && isDevelopment ? "/api" : process.env.NEXT_PUBLIC_AUTH_API_URL;

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
  const { token, params, ...fetchOptions } = options;

 let url: URL;

  // Handle absolute vs relative baseURL
  if (baseURL?.startsWith("http")) {
    url = new URL(`${baseURL}${endpoint}`);
  } else {
    // Relative URL: must use window.location.origin on client
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    url = new URL(`${baseURL}${endpoint}`, origin);
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

  const data = await response.json();

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    if(response.status === 401 && window !== undefined) {
      window.location.reload();
    }
    throw new APIError(response.status, error.error || "Request failed", error);
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
