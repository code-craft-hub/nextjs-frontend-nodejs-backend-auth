import { baseURL } from "../api/client";
import { createApiClient, setupInterceptors } from "./base";

export const axiosApiClient = createApiClient({
  baseURL: baseURL ?? "/api",
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
