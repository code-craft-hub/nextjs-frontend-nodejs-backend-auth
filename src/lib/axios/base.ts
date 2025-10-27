// src/lib/axios/base.ts
import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
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
    console.warn("⚠️ [Axios] Could not access cookies:", error);
    return null;
  }
}

export const createApiClient = (config: ApiClientConfig): AxiosInstance => {
  const client = axios.create({
    timeout: 10000,
    // Only use withCredentials on client-side
    withCredentials: !isServer(),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...config,
  });

  return client;
};

// Common interceptor setup function
export const setupInterceptors = (client: AxiosInstance, apiName: string) => {
  // Request interceptor
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Add timestamp for performance tracking
      (config as any).metadata = { startTime: new Date() };

      const isServerSide = isServer();
      if (isServerSide) {
        const serverCookies = await getServerCookies();
        if (serverCookies) {
          config.headers.Cookie = serverCookies;
          
        } 
      }

      return config;
    },
    (error) => {
      console.error(`❌ [${apiName}] Request Error:`, error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
     

      return response;
    },
    (error) => {
      const apiError = `[${apiName}] ${
        error.response?.status || "Network Error"
      }`;

      // Handle different error scenarios
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            console.error(`${apiError}: Unauthorized`);
            // Handle based on API type
            if (apiName !== "AUTH" && typeof window !== "undefined") {
              // Only redirect for non-auth APIs to avoid infinite loops
              window.location.href = "/login";
            }
            break;
          case 403:
            console.error(`${apiError}: Forbidden`);
            break;
          case 404:
            console.error(`${apiError}: Resource not found`);
            break;
          case 500:
            console.error(`${apiError}: Internal server error`);
            break;
          default:
            console.error(`${apiError}:`, data?.message || "Unknown error");
        }
      } else if (error.request) {
        console.error(`${apiError}: Network error - no response received`);
      } else {
        console.error(`${apiError}: Request setup error:`, error.message);
      }

      return Promise.reject(error);
    }
  );
};
