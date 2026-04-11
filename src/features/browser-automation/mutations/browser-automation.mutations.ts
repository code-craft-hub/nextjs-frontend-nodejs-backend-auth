"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/query/keys";
import { browserAutomationApi } from "../api/browser-automation.api";
import type { SubmitApplicationPayload } from "../types/browser-automation.types";

/**
 * Enqueues a browser-automation form-submission job for the given job post.
 *
 * On settle, invalidates:
 *  - `jobApplications.all` — the newly-created "applying" record created by
 *    the automation service becomes visible in application history lists.
 *  - `users.all`           — the user's `appliedJobs` count in ReportCard
 *    stays accurate after `recordApplication` runs alongside this mutation.
 */
export function useSubmitBrowserApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitApplicationPayload) =>
      browserAutomationApi.submitApplication(payload),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.jobApplications.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
