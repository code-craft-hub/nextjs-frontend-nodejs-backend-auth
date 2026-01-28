import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userQueries } from "@/lib/queries/user.queries";
import { onboardingQueries } from "@/lib/queries/user/onboarding.queries";
import {
  updateOnboardingStep,
  OnboardingUpdatePayload,
  OnboardingUpdateResponse,
} from "@/lib/api/user/onboarding.api";

export interface UseUpdateOnboardingOptions {
  onSuccess?: (
    data: OnboardingUpdateResponse,
    variables: OnboardingUpdatePayload,
  ) => void;
  onError?: (error: Error, variables: OnboardingUpdatePayload) => void;
  showToast?: boolean;
  userFirstName?: string;
  optimisticUpdate?: boolean;
}

export const useUpdateOnboarding = (
  options: UseUpdateOnboardingOptions = {},
) => {
  const queryClient = useQueryClient();
  const {
    onSuccess,
    onError,
    showToast = true,
    userFirstName,
    optimisticUpdate = true,
  } = options;

  return useMutation<
    OnboardingUpdateResponse,
    Error,
    OnboardingUpdatePayload,
    { previousUser?: any; previousOnboarding?: any }
  >({
    mutationFn: updateOnboardingStep,

    onMutate: async (newData) => {
      if (!optimisticUpdate) return {};

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: userQueries.detail().queryKey,
        }),
        queryClient.cancelQueries({
          queryKey: onboardingQueries.status(),
        }),
      ]);

      const previousUser = queryClient.getQueryData(
        userQueries.detail().queryKey,
      );
      const previousOnboarding = queryClient.getQueryData(
        onboardingQueries.status(),
      );

      queryClient.setQueryData(userQueries.detail().queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...newData,
          onboardingStep: newData.stepNumber,
          updatedAt: new Date().toISOString(),
        };
      });

      queryClient.setQueryData(onboardingQueries.status(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          currentStep: newData.stepNumber,
          completed: false,
        };
      });

      return { previousUser, previousOnboarding };
    },

    onError: (error, variables, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          userQueries.detail().queryKey,
          context.previousUser,
        );
      }
      if (context?.previousOnboarding) {
        queryClient.setQueryData(
          onboardingQueries.status(),
          context.previousOnboarding,
        );
      }

      // Log error for debugging
      console.error("[useUpdateOnboarding] Mutation failed:", {
        error,
        variables,
        timestamp: new Date().toISOString(),
      });

      // Show error toast
      if (showToast) {
        toast.error("Failed to save your data. Please try again.");
      }

      // Call custom error handler
      onError?.(error, variables);
    },

    // Handle mutation success
    onSuccess: (data, variables, _context) => {
      if (showToast) {
        const name = userFirstName ? `${userFirstName}, ` : "";
        toast.success(`${name}your data has been saved!`);
      }

      // Call custom success handler
      onSuccess?.(data, variables);
    },

    // Always run after mutation (success or error)
    onSettled: (_data, _error, _variables, _context) => {
      queryClient.invalidateQueries({
        queryKey: userQueries.all().queryKey,
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: onboardingQueries.all,
      });

      // Also invalidate broader user queries to catch any related updates
      queryClient.invalidateQueries({
        queryKey: ["user"],
        exact: false,
      });
    },

    retry: (failureCount, error) => {
      // Don't retry on validation errors (4xx except 429)
      if (error instanceof Error) {
        const axiosError = error as any;
        if (
          axiosError.response?.status >= 400 &&
          axiosError.response?.status < 500 &&
          axiosError.response?.status !== 429
        ) {
          return false;
        }
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
