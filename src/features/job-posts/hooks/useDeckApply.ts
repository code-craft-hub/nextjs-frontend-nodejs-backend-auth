"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { resumeApi } from "@/features/resume/api/resume.api";
import { queryKeys } from "@/shared/query/keys";
import { buildExtensionProfile } from "./useApplyOrchestrator";
import { useLogApplicationEventMutation } from "../mutations/application-events.mutation";
import type { JobPost } from "@/features/job-posts";
import type { ExtensionProfile } from "./useExtension";

type EnqueueJob = (
  job: {
    id: string;
    title?: string | null;
    company?: string | null;
    location?: string | null;
    applyUrl?: string | null;
  },
  profile?: ExtensionProfile | null,
) => void;

/**
 * Returns a stable `handleDeckApply` callback shared by the Jobs page and
 * the Dashboard home page.  The caller must supply `enqueueJob` (from
 * useRunManager) and `extState` (from useApplyOrchestrator) — this hook
 * owns only the user-profile and default-resume queries so they aren't
 * duplicated inline in every consuming component.
 */
export function useDeckApply({
  enqueueJob,
  extState,
}: {
  enqueueJob: EnqueueJob;
  extState: string;
}) {
  const { data: user } = useQuery(userQueries.detail());

  const { data: defaultResumeData } = useQuery({
    queryKey: queryKeys.resumes.myDefault(),
    queryFn: () => resumeApi.getMyDefaultResume(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const defaultResumeFileUrl = defaultResumeData?.data?.fileUrl ?? null;
  const { mutate: logApplicationEvent } = useLogApplicationEventMutation();

  return useCallback(
    (job: JobPost) => {
      if (extState === "installed") {
        const profile = user
          ? { ...buildExtensionProfile(user), cv_url: defaultResumeFileUrl }
          : null;
        enqueueJob(job, profile);
      } else {
        const url = job.applyUrl ?? job.link;
        if (url) {
          const w = window.open(url, "_blank");
          if (w) { w.blur(); window.focus(); }
        }
        // No extension installed — this is a plain manual apply, same as
        // useApplyOrchestrator's fallback branch. Record it here since
        // nothing else in the deck-swipe flow logs this submission.
        logApplicationEvent({
          jobId: job.id,
          jobTitleSnapshot: job.title ?? "Untitled Position",
          companySnapshot: job.companyName ?? null,
          applicationType: "manual_click",
          submittedAt: new Date().toISOString(),
        });
      }
    },
    [extState, user, defaultResumeFileUrl, enqueueJob, logApplicationEvent],
  );
}
