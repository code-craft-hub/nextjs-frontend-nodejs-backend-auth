"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import type { JobPost } from "@/types";
import { BOOKMARK_IDS_QUERY_KEY } from "./useBookmarkedJobIds";
import { useApplyJob } from "@/hooks/useApplyJob";

/**
 * Encapsulates all job interaction side-effects (bookmark, apply).
 * Both desktop columns and mobile cards share this hook — no duplication.
 * Apply logic lives in useApplyJob (src/hooks/useApplyJob.ts).
 */
export function useJobActions() {
  const queryClient = useQueryClient();
  const { mutate: updateJobMutate } = useUpdateJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  const handleBookmark = useCallback(
    (job: JobPost) => {
      updateJobMutate(
        {
          id: String(job.id),
          data: { isBookmarked: !job.isBookmarked },
        },
        {
          // Invalidate bookmark IDs cache so useBookmarkedJobIds re-derives
          // isBookmarked state from the bookmarks API (source of truth).
          onSettled: () =>
            queryClient.invalidateQueries({ queryKey: BOOKMARK_IDS_QUERY_KEY }),
        },
      );
    },
    [updateJobMutate, queryClient],
  );

  return { handleBookmark, handleApply };
}
