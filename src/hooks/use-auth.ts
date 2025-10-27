"use client";

import authClient from "@/lib/axios/auth-api";
import { RegisterUserSchema } from "@/lib/schema-validations";
import { CoverLetter, IUser, Resume } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const apiService = {
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
      const { data } = await authClient.get("/users");
      return data.data;
    } catch (error: any) {
      throw new Error(
        "Failed to fetch user data:",
        error.error || "Fetch failed"
      );
    }
  },
  gmailOauthStatus: async (
    email?: string
  ): Promise<{ isAuthorized: boolean }> => {
    try {
      const { data } = await authClient.get(
        `/google-gmail-oauth/auth-status/${email && encodeURIComponent(email)}`
      );
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

  getCareerDoc: async <T>(
    documentId: string,
    collection: string
  ): Promise<T> => {
    try {
      const { data } = await authClient.get(
        `/career-doc/${documentId}?collection=${collection}`
      );
      return data.data;
    } catch (error: any) {
      throw new Error(
        "Failed to fetch user data:",
        error.error || "Fetch failed"
      );
    }
  },

  updateCareerDoc: async <T>(
    documentId: string,
    collection: string,
    input: Partial<T>
  ) => {
    try {
      const { data } = await authClient.patch(
        `/career-doc/${collection}/${documentId}`,
        {
          updates: input,
        }
      );
      return data.data;
    } catch (error: any) {
      throw new Error(
        "Failed to update document:",
        error.error || "Update failed"
      );
    }
  },

  getAllDoc: async <T>(collection: string): Promise<T> => {
    try {
      const { data } = await authClient.get(
        `/career-doc/?collection=${collection}`
      );
      return data.data;
    } catch (error: any) {
      throw new Error(
        "Failed to fetch all documents:",
        error.error || "Fetch failed"
      );
    }
  },

  getPaginatedDoc: async <T>(collection: string): Promise<T> => {
    try {
      const { data } = await authClient.get(
        `/career-doc/paginated/?collection=${collection}`
      );
      return data.data;
    } catch (error: any) {
      throw new Error(
        "Failed to fetch all documents:",
        error.error || "Fetch failed"
      );
    }
  },

  deleteCareerDoc: async (
    id: string,
    collection: string
  ): Promise<Partial<IUser>> => {
    try {
      const { data } = await authClient.delete(
        `/career-doc/${id}/${collection}`
      );
      return data.data;
    } catch (error: any) {
      throw new Error(error.error || "Deleting document failed");
    }
  },
  sendApplication: async (
    user: Partial<IUser>,
    coverLetterData: CoverLetter | undefined,
    resumeData: Resume | undefined,
    recruiterEmail: string,
    jobDescription: string
  ): Promise<Partial<IUser>> => {
    try {
      const { data } = await authClient.post(
        "/send-email-with-resume-and-coverletter",
        {
          user,
          coverLetterData,
          resumeData,
          recruiterEmail,
          jobDescription,
        }
      );

      return data.data;
    } catch (error: any) {
      console.error("ERROR IN auto-apply: ", error);

      throw error;
      // throw new Error(error.error || "Auto apply failed. Please try again.");
    }
  },
};

export function useAuth(initialUser?: Partial<IUser>) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: apiService.getUser,
    retry: false,
    staleTime: 1000 * 60 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    initialData: initialUser || undefined,
  });

  const useCareerDoc = <T>(documentId: string, collection: string) => {
    return useQuery({
      // FIXED: Include collection in the query key!
      queryKey: ["auth", "careerDoc", collection, documentId],
      queryFn: async () => {
        if (!documentId) throw new Error("No documentId provided");
        return apiService.getCareerDoc<T>(documentId, collection);
      },
      enabled: !!documentId && !!collection,
      staleTime: 0, // Always fetch fresh data
      refetchOnMount: true, // Always refetch when component mounts
    });
  };

  const useGetAllDoc = <T>(collection: string) => {
    return useQuery({
      queryKey: ["auth", "getAllDoc", collection],
      queryFn: async () => {
        return apiService.getAllDoc<T>(collection);
      },
    });
  };
  const updateUserMutation = useMutation({
    mutationFn: (data: any) => apiService.updateUser(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data);
      // router.push("/dashboard/home");
    },
  });
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiService.login(email, password),
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
    mutationFn: (user: RegisterUserSchema) => apiService.register(user),
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
    mutationFn: apiService.sendVerificationEmail,
    onError: (error) => {
      console.error("Send verification failed:", error.message);
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (code: string) => apiService.verifyEmail(code),
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
    mutationFn: apiService.logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear(); // Clear all cached data
      router.push("/login");
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: apiService.completeOnboarding,
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "user"], data);
      router.push("/dashboard/home");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    useCareerDoc,
    useGetAllDoc,
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
