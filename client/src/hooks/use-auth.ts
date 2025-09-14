"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

interface AuthResponse {
  success: boolean;
  user: User;
}

interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

interface AuthResponse {
  success: boolean;
  user: User;
}

// Auth API functions
const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    console.log("Response from login API:", response);
    return response.json();
  },

  register: async (
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    return response.json();
  },

  logout: async (): Promise<{ success: boolean }> => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    return response.json();
  },

  getUser: async (): Promise<{ user: User }> => {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  },

  sendVerificationEmail: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await fetch("/api/auth/send-verification", {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send verification email");
    }

    return response.json();
  },

  verifyEmail: async (code: string): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Email verification failed");
    }

    return response.json();
  },

  completeOnboarding: async (): Promise<AuthResponse> => {
    const response = await fetch("/api/auth/complete-onboarding", {
      method: "POST",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to complete onboarding");
    }

    return response.json();
  },
};

export function useAuth(initialUser?: User) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get current user with optional initial data
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authApi.getUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: initialUser ? { user: initialUser } : undefined,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], { user: data.user });
      // Check email verification first, then onboarding
      console.log("Login successful in login mutation", data.user);
      if (!data.user.emailVerified) {
        router.push("/verify-email");
      } else if (!data.user.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error.message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name?: string;
    }) => authApi.register(email, password, name),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], { user: data.user });
      // New users need to verify email first
      router.push("/verify-email");
    },
    onError: (error) => {
      console.error("Registration failed:", error.message);
    },
  });

  // Send verification email mutation
  const sendVerificationMutation = useMutation({
    mutationFn: authApi.sendVerificationEmail,
    onError: (error) => {
      console.error("Send verification failed:", error.message);
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (code: string) => authApi.verifyEmail(code),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], { user: data.user });
      // After email verification, go to onboarding
      router.push("/onboarding");
    },
    onError: (error) => {
      console.error("Email verification failed:", error.message);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear(); // Clear all cached data
      router.push("/login");
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], { user: data.user });
      router.push("/dashboard");
    },
  });

  return {
    user: user?.user,
    isLoading,
    isAuthenticated: !!user?.user,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    sendVerificationEmail: sendVerificationMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    completeOnboarding: completeOnboardingMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isSendingVerification: sendVerificationMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isOnboardingLoading: completeOnboardingMutation.isPending,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
    verificationError: sendVerificationMutation.error?.message,
    verifyEmailError: verifyEmailMutation.error?.message,
  };
}
