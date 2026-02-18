import { useMutation, useQueryClient } from "@tanstack/react-query";
import { emailApplicationApi } from "../api/email-application.api";
import {
  invalidateEmailApplicationQueries,
  invalidateEmailApplicationLists,
} from "../queries/email-application.invalidation";
import {
  invalidateResumeQueries,
  invalidateCoverLetterQueries,
  invalidateAIApplyQueries,
} from "@/lib/query/query-invalidation";

/**
 * Hook for deleting an email application
 * Handles deletion with proper cache invalidation
 */
export function useDeleteEmailApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      autoApplyId,
      resumeId,
      coverLetterId,
    }: {
      autoApplyId: string;
      resumeId: string;
      coverLetterId: string;
    }) =>
      emailApplicationApi.deleteApplication(
        autoApplyId,
        resumeId,
        coverLetterId,
      ),

    onSettled: () => {
      // Invalidate related cached queries after deletion
      return Promise.all([
        invalidateEmailApplicationQueries(queryClient),
        invalidateResumeQueries(queryClient),
        invalidateCoverLetterQueries(queryClient),
        invalidateAIApplyQueries(queryClient),
      ]);
    },
  });
}
