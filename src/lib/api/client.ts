// lib/api/client.ts

const baseURL =
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

// 🔑 Helper to detect if we're on the server
function isServer() {
  return typeof window === "undefined";
}

// 🔑 Helper to get cookies on server-side
async function getServerCookies(): Promise<string | null> {
  if (!isServer()) {
    return null; // Client-side, return null
  }

  try {
    const { cookies } = await import("next/headers");

    const cookieStore = await cookies();
    const cookieString = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    return cookieString || null;
  } catch (error) {
    // cookies() might throw in some contexts (like route handlers in some cases)
    console.warn("⚠️ Could not access cookies:", error);
    return null;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const { params, ...fetchOptions } = options;

    const isServerSide = isServer();
    let url = `${baseURL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add any additional headers from options
    if (fetchOptions.headers) {
      const existingHeaders = new Headers(fetchOptions.headers);
      existingHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    }

    // 🔑 AUTOMATIC: Get and forward cookies if on server
    if (isServerSide) {
      const serverCookies = await getServerCookies();
      if (serverCookies) {
        headers["Cookie"] = serverCookies;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
      cache: "no-store",
      next: {
        revalidate: 0,
        ...fetchOptions.next,
      },
    });

    if (!response.ok) {
      // const errorData = await response.json().catch(() => ({}));
      // console.error("❌ API Error:", response.status, errorData);
      // console.error(response.status, response.statusText, errorData);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    // console.error("🔥 API Client Error:", error);
    throw error;
  }
}

// Helper methods - now fully automatic!
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
