import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  invalidateEmailApplicationQueries,
  invalidateEmailApplicationLists,
} from "../queries/email-application.invalidation";
import {
  invalidateResumeQueries,
  invalidateCoverLetterQueries,
  invalidateAIApplyQueries,
} from "@/shared/query/query-invalidation";
import { autoApplyApi } from "@/features/auto-apply/api/auto-apply.api";
import { resumeApi } from "@/features/resume/api/resume.api";
import { coverLetterApi } from "@/features/cover-letter/api/cover-letter.api";

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
    }) => {
      return Promise.all([
        autoApplyApi.delete(autoApplyId),
        resumeApi.hardDeleteResume(resumeId),
        coverLetterApi.hardDeleteCoverLetter(coverLetterId),
      ]);
    },

    onSettled: () => {
      return Promise.all([
        invalidateEmailApplicationQueries(queryClient),
        invalidateResumeQueries(queryClient),
        invalidateCoverLetterQueries(queryClient),
        invalidateAIApplyQueries(queryClient),
        invalidateEmailApplicationLists(queryClient),
      ]);
    },
  });
}
