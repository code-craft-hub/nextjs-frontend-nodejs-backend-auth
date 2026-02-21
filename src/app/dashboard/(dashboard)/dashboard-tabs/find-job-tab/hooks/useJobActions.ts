"use client";

import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useUpdateJobApplicationHistoryMutation,
  useUpdateJobMutation,
} from "@/lib/mutations/jobs.mutations";
import type { JobPost } from "@/types";
import { BOOKMARK_IDS_QUERY_KEY } from "./useBookmarkedJobIds";
import { gmailApi } from "@/lib/api/gmail.api";

/**
 * Encapsulates all job interaction side-effects (bookmark, apply).
 * Both desktop columns and mobile cards share this hook — no duplication.
 */
export function useJobActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: updateJobMutate } = useUpdateJobMutation();
  const { mutate: recordApplicationMutate } =
    useUpdateJobApplicationHistoryMutation();

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

  const handleApply = useCallback(
    async (job: JobPost, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      const link = !!job.applyUrl ? job.applyUrl : job.link;

      try {
        if (!job.emailApply) {
          recordApplicationMutate({
            id: String(job.id),
            data: { appliedJobs: job.id },
          });
          window.open(link, "_blank", "noopener,noreferrer");
          return;
        }

        const { data } = await gmailApi.checkAuthStatus();
        const authorized = data?.authorized;
        if (!authorized) {
          toast.error(
            "✨ Go to Settings and authorize Cver AI to send emails on your behalf.",
            {
              action: {
                label: "Authorize now",
                onClick: () =>
                  router.push("/dashboard/settings?tab=ai-applypreference"),
              },
              classNames: {
                actionButton:
                  "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
              },
            },
          );
          return;
        }

        recordApplicationMutate({
          id: String(job.id),
          data: { appliedJobs: job.id },
        });

        const params = new URLSearchParams({
          jobDescription: JSON.stringify(job.descriptionText ?? ""),
          recruiterEmail: encodeURIComponent(job.emailApply),
        });
        router.push(
          `/dashboard/tailor-cover-letter/${uuidv4()}?${params}&aiApply=true`,
        );
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    },
    [router, recordApplicationMutate],
  );

  return { handleBookmark, handleApply };
}
