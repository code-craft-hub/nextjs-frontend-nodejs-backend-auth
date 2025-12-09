import { createApiClient, setupInterceptors } from "./base";

export const axiosApiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8080",
  timeout: 60000, // Longer timeout for authentication operations
  withCredentials: true, // Important for httpOnly cookies
});

// Setup common interceptors
setupInterceptors(axiosApiClient, "AUTH");

// Auth-specific interceptors
axiosApiClient.interceptors.request.use((config) => {
  config.headers["X-Client-Type"] = "web";
  return config;
});

axiosApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
