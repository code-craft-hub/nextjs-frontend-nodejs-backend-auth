const baseURL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080/api";

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'APIError';
  }
}

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}
// lib/api/client.ts
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  console.log('API Request:', endpoint, params, fetchOptions);

  // Build URL with query params - FILTER OUT UNDEFINED
  let url = `${baseURL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      // Skip undefined, null, and empty string values
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  console.log('🌐 Final URL:', url);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include',
    cache: 'no-store', // IMPORTANT: Don't cache on server
    next: {
      revalidate: 0, // Don't use Next.js cache for now
      ...fetchOptions.next,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error:', response.status, errorData);
    throw new APIError(response.status, response.statusText, errorData);
  }

  const data = await response.json();
  console.log('✅ API Response:', {
    endpoint,
    hasData: !!data,
    dataKeys: Object.keys(data || {}),
  });

  return data;
}

// Helper methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};