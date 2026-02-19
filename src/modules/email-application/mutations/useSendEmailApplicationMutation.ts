import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emailApplicationApi } from "../api/email-application.api";
import type { SendEmailApplicationPayload } from "../api/email-application.api.types";
import {
  invalidateEmailApplicationQueries,
} from "../queries/email-application.invalidation";
import {
  invalidateResumeQueries,
  invalidateCoverLetterQueries,
  invalidateAIApplyQueries,
} from "@/lib/query/query-invalidation";
import { invalidateUserQueries } from "@module/user";

/**
 * Hook for sending an email application
 * Handles application submission with proper cache invalidation
 */
export function useSendEmailApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendEmailApplicationPayload) =>
      emailApplicationApi.sendApplication(payload),

    onSettled: () => {
      // Invalidate related cached queries after submission
      // This ensures fresh data is loaded on redirect/refresh
      return Promise.all([
        invalidateEmailApplicationQueries(queryClient),
        invalidateResumeQueries(queryClient),
        invalidateCoverLetterQueries(queryClient),
        invalidateAIApplyQueries(queryClient),
        invalidateUserQueries(queryClient),
      ]);
    },
  });
}
