"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { resumeApi } from "@/features/resume/api/resume.api";
import { queryKeys } from "@/shared/query/keys";
import { buildExtensionProfile } from "./useApplyOrchestrator";
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

  return useCallback(
    (job: JobPost) => {
      if (extState === "installed") {
        const profile = user
          ? { ...buildExtensionProfile(user), cv_url: defaultResumeFileUrl }
          : null;
        enqueueJob(job, profile);
      } else {
        const url = job.applyUrl ?? job.link;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    [extState, user, defaultResumeFileUrl, enqueueJob],
  );
}
