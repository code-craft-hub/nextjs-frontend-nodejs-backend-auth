"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/query/keys";
import { browserAutomationApi } from "../api/browser-automation.api";
import type { SubmitApplicationPayload, ResumeApplicationPayload } from "../types/browser-automation.types";

export function useSubmitBrowserApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitApplicationPayload) =>
      browserAutomationApi.submitApplication(payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useResumeBrowserApplicationMutation() {
  return useMutation({
    mutationFn: (payload: ResumeApplicationPayload) =>
      browserAutomationApi.resumeApplication(payload),
  });
}
