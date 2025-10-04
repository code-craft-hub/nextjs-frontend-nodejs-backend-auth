"use client";

import authClient from "@/lib/axios/auth-api";
import { RegisterUserSchema } from "@/lib/schema-validations";
import { IUser } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// interface AuthResponse {
//   success: boolean;
//   data: Partial<IUser>;
// }

// interface AuthResponse {
//   success: boolean;
//   data: Partial<IUser>;
// }

// Auth API functions
export const authApi = {
  login: async (email: string, password: string): Promise<Partial<IUser>> => {
    try {
      const { data } = await authClient.post("/login", {
        email,
        password,
      });

      return data.data;
    } catch (error: any) {
      console.error("ERROR IN LOGIN FUNCTION : ", error);
      toast.error(
        error?.response?.data?.error ||
          "Login failed. Please check your credentials."
      );

      throw new Error(error.error || "Login failed");
    }
  },

  register: async (user: RegisterUserSchema): Promise<Partial<IUser>> => {
    try {
      const { data } = await authClient.post("/register", user);
      toast.success("Registration successful! Please verify your email.");

      return data.data;
    } catch (error: any) {
      console.error("ERROR IN REGISTER FUNCTION : ", error);
      toast.error(error?.response?.data?.error || "Registration failed");
      throw new Error(error?.response.data.error || "Registration failed");
    }
  },

  logout: async (): Promise<{ success: boolean }> => {
    try {
      const { data } = await authClient.post("/logout");
      return data.data;
    } catch (error: any) {
      throw new Error(error.error || "Logout failed");
    }
  },
  deleteUser: async (): Promise<{ success: boolean }> => {
    try {
      const { data } = await authClient.delete("/delete");
      toast.success("User account deleted successfully");
      window.location.href = "/register";
      return data.data;
    } catch (error: any) {
      throw new Error(error.error || "Deleting user account failed");
    }
  },

  getUser: async (): Promise<IUser> => {
    try {
      const { data } = await authClient.get("/profile");
      return data.data;
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
      return data.data;
    } catch (error: any) {
      throw new Error(error.error || "Login failed");
    }
  },

  verifyEmail: async (code: string): Promise<Partial<IUser>> => {
    try {
      const { data } = await authClient.post("/verify-email", { code });

      return data.data;
    } catch (error: any) {
      throw new Error(error.error || "Login failed");
    }
  },

  completeOnboarding: async (): Promise<Partial<IUser>> => {
    try {
      const { data } = await authClient.post("/complete-onboarding");
      return data.data;
    } catch (error: any) {
      throw new Error(error.error || "Login failed");
    }
  },
  updateUser: async (input: any): Promise<Partial<IUser>> => {
    try {
      const { data } = await authClient.put("/update", input);
      return data.data;
    } catch (error: any) {
      throw new Error(error.error || "Updating user failed");
    }
  },
};

export function useAuth(initialUser?: Partial<IUser>) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: authApi.getUser,
    retry: false,
    staleTime: 1000 * 60 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    initialData: initialUser || undefined,
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => authApi.updateUser(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data);
      // router.push("/dashboard/home");
    },
  });
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data);
      // Check email verification first, then onboarding
      toast.success("Login successful!");
      if (!data?.emailVerified) {
        router.push("/verify-email");
      } else if (!data?.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard/home");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (user: RegisterUserSchema) => authApi.register(user),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data);
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
      queryClient.setQueryData(["auth", "user"], data);
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
      queryClient.setQueryData(["auth", "user"], data);
      router.push("/dashboard/home");
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
