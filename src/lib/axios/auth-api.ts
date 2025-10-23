import {
  createApiClient,
  setupInterceptors,
} from "./base";

const authClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080",
  timeout: 60000, // Longer timeout for authentication operations
  withCredentials: true, // Important for httpOnly cookies
});

// Setup common interceptors
setupInterceptors(authClient, "AUTH");

// Auth-specific interceptors
authClient.interceptors.request.use((config) => {
  config.headers["X-Client-Type"] = "web";
  return config;
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth-specific errors
    if (error.response?.status === 401) {
      // For auth API, don't redirect - just clear any stored tokens
      if (typeof window !== "undefined") {
        // Dispatch logout event or call logout function
        // window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);
export default authClient;
