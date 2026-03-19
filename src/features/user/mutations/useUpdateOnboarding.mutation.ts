import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userQueries } from "../queries/user.queryOptions";
import { onboardingQueries } from "../queries/onboarding.queryKeys";
import {
  updateOnboardingStep,
  type OnboardingUpdatePayload,
  type OnboardingUpdateResponse,
} from "../api/onboarding.api";

export interface UseUpdateOnboardingOptions {
  onSuccess?: (
    data: OnboardingUpdateResponse,
    variables: OnboardingUpdatePayload,
  ) => void;
  onError?: (error: Error, variables: OnboardingUpdatePayload) => void;
  showToast?: boolean;
  userFirstName?: string;
  optimisticUpdate?: boolean;
  customMessage?: string;
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
    customMessage,
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

      console.error("[useUpdateOnboarding] Mutation failed:", {
        error,
        variables,
        timestamp: new Date().toISOString(),
      });

      if (showToast) {
        toast.error("Failed to save your data. Please try again.");
      }

      onError?.(error, variables);
    },

    onSuccess: (data, variables, _context) => {
      if (showToast) {
        const name = userFirstName ? `${userFirstName}, ` : "";
        toast.success(customMessage ? customMessage : `${name}your data has been saved!`);
      }

      onSuccess?.(data, variables);
    },

    onSettled: (_data, _error, _variables, _context) => {
      queryClient.invalidateQueries({
        queryKey: userQueries.all().queryKey,
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: onboardingQueries.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["user"],
        exact: false,
      });
    },

    retry: (failureCount, error) => {
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
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
