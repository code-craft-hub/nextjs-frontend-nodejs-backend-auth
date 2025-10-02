import {
  createApiClient,
  setupInterceptors,
  createApiMethods,
  ApiMethods,
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
        // localStorage?.removeItem("authToken");
        // Dispatch logout event or call logout function
        // window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);

// Create API methods
const authMethods = createApiMethods(authClient);

// Auth-specific extended API
interface AuthAPI extends ApiMethods {
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<any>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
  }) => Promise<any>;
  refreshToken: () => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
  getProfile: () => Promise<any>;
}

export const authAPI: AuthAPI = {
  ...authMethods,
  login: (credentials) => authMethods.post("/login", credentials),
  logout: () => authMethods.post("/logout"),
  register: (userData) => authMethods.post("/register", userData),
  refreshToken: () => authMethods.post("/refresh"),
  forgotPassword: (email) => authMethods.post("/forgot-password", { email }),
  resetPassword: (token, password) =>
    authMethods.post("/reset-password", { token, password }),

  // Email verification
  verifyEmail: (token) => authMethods.post("/verify-email", { token }),

  // Profile management
  getProfile: () => authMethods.get("/profile"),
};

export default authClient;
