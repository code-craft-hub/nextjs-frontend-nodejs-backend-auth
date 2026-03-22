import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userFeedbackApi } from "../api/user-feedback.api";
import { userFeedbackQueryKeys } from "../queries/user-feedback.queryKeys";
import type { SubmitFeedbackPayload, IUserFeedback } from "../api/user-feedback.api.types";

export interface UseSubmitFeedbackOptions {
  onSuccess?: (data: IUserFeedback) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export function useSubmitFeedback(options: UseSubmitFeedbackOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, showToast = true } = options;

  return useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) =>
      userFeedbackApi.submit(payload),

    onSuccess: (response) => {
      if (showToast) {
        toast.success("Thank you! Your feedback has been submitted.");
      }

      // Invalidate the user's own feedback list so it reflects the new entry.
      queryClient.invalidateQueries({
        queryKey: userFeedbackQueryKeys.mine(),
      });

      onSuccess?.(response.data);
    },

    onError: (error: Error) => {
      if (showToast) {
        toast.error("Failed to submit feedback. Please try again.");
      }
      onError?.(error);
    },

    retry: (failureCount, error: any) => {
      // Don't retry on 4xx client errors.
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
  });
}
