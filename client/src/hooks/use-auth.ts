"use client";

import authClient from "@/lib/axios/auth-api";
import { RegisterUserSchema } from "@/lib/schema-validations";
import { IUser } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// interface User {
//   uid: string;
//   email: string;
//   emailVerified: boolean;
//   role?: string;
//   onboardingComplete: boolean;
// }

interface AuthResponse {
  success: boolean;
  user: IUser;
}

interface AuthResponse {
  success: boolean;
  user: IUser;
}

// Auth API functions
const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data } = await authClient.post("/login", {
        email,
        password,
      });

      console.log("response : ", data);
      return data;
    } catch (error: any) {
      console.log("ERROR IN LOGIN FUNCTION : ", error);
      throw new Error(error.error || "Login failed");
    }
  },

  register: async (user: RegisterUserSchema): Promise<AuthResponse> => {
    try {
      console.log("USER IN REGISTER FUNCTION : ", user);
      const { data } = await authClient.post("/register", user);
      toast.success("Registration successful! Please verify your email.");

      return data;
    } catch (error: any) {
      console.log("ERROR IN REGISTER FUNCTION : ", error);
      toast.error(error?.response?.data?.error || "Registration failed");
      throw new Error(error?.response.data.error || "Registration failed");
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      const { data } = await authClient.post("/logout");
      return data;
    } catch (error: any) {
      throw new Error(error.error || "Logout failed");
    }
  },

  getUser: async (): Promise<IUser> => {
    try {
      const { data } = await authClient.get("/profile");
      console.log("GET USER DATA : ", data);
      return data;
    } catch (error: any) {
      throw new Error(
        "Failed to fetch user data:",
        error.error || "Fetch failed"
      );
    }
  },

  sendVerificationEmail: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const { data } = await authClient.post("/send-verification");
      return data;
    } catch (error: any) {
      throw new Error(error.error || "Login failed");
    }
  },

  verifyEmail: async (code: string): Promise<AuthResponse> => {
    try {
      const { data } = await authClient.post("/verify-email", { code });

      return data;
    } catch (error: any) {
      throw new Error(error.error || "Login failed");
    }
  },

  completeOnboarding: async (): Promise<AuthResponse> => {
    try {
      const { data } = await authClient.post("/complete-onboarding");
      return data;
    } catch (error: any) {
      throw new Error(error.error || "Login failed");
    }
  },
  updateUser: async (): Promise<AuthResponse> => {
    try {
      const { data } = await authClient.post("/update");
      return data;
    } catch (error: any) {
      throw new Error(error.error || "Updating user failed");
    }
  },
};

export function useAuth(initialUser?: IUser) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authApi.getUser,
    retry: false,
    staleTime: 1000 * 60 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    initialData: initialUser || undefined,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], { user: data.user });
      // Check email verification first, then onboarding
      console.log("Login successful in login mutation", data.user);
      toast.success("Login successful!");
      if (!data.user.emailVerified) {
        router.push("/verify-email");
      } else if (!data.user.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login failed:", error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (user: RegisterUserSchema) => authApi.register(user),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], { user: data.user });
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

  // Update user information
  const updateUserMutation = useMutation({
    mutationFn: authApi.updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], { user: data.user });
      router.push("/dashboard");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    sendVerificationEmail: sendVerificationMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    completeOnboarding: completeOnboardingMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,

    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isSendingVerification: sendVerificationMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isOnboardingLoading: completeOnboardingMutation.isPending,
    isUpdatingUserLoading: updateUserMutation.isPending,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error,
    verificationError: sendVerificationMutation.error?.message,
    verifyEmailError: verifyEmailMutation.error?.message,
  };
}
