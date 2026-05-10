"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sendGTMEvent } from "@next/third-parties/google";
import { cn } from "@/lib/utils";
import { userQueries } from "@features/user";
import { ReportCard } from "@/features/jobs/components/ReportCard";
import { JobList } from "@/features/job-posts";
import { JobSearchForm } from "@/features/job-posts/components/JobSearchForm";
import { useSidebar } from "@/components/ui/sidebar";
import LeftMenu from "./LeftMenu";
import { RunModal } from "./RunModal";
import { IframeStage } from "./IframeStage";
import { useRunManager } from "../hooks/useRunManager";
import {
  buildExtensionProfile,
  useApplyOrchestrator,
} from "../hooks/useApplyOrchestrator";
import { resumeApi } from "@/features/resume/api/resume.api";
import { queryKeys } from "@/shared/query/keys";

// Canonical country names — must match the scraper's localizedTo values exactly.
const SUPPORTED_COUNTRIES = [
  "Australia",
  "Canada",
  "Germany",
  "Ireland",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Singapore",
  "United Kingdom",
  "United States",
] as const;

type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

function resolveCountry(input?: string | null): SupportedCountry | undefined {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  return SUPPORTED_COUNTRIES.find((c) => c.toLowerCase() === normalized);
}

export default function Overview() {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [localizedTo, setLocalizedTo] = useState<string | undefined>(undefined);
  const [classification, setClassification] = useState<string | undefined>(
    undefined,
  );
  const [countryInitialized, setCountryInitialized] = useState(false);

  const { data: user } = useQuery(userQueries.detail());

  const { data: defaultResumeData } = useQuery({
    queryKey: queryKeys.resumes.myDefault(),
    queryFn: () => resumeApi.getMyDefaultResume(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const defaultResumeFileUrl = defaultResumeData?.data?.fileUrl ?? null;

  const defaultCountry = useMemo(
    () => resolveCountry(user?.country),
    [user?.country],
  );

  useEffect(() => {
    if (defaultCountry && !countryInitialized) {
      setLocalizedTo(defaultCountry);
      setCountryInitialized(true);
    }
  }, [defaultCountry, countryInitialized]);

  const handleSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    setQuery(trimmed.length ? trimmed : undefined);
  }, []);

  const handleCountryChange = useCallback((value: string) => {
    setLocalizedTo(value.length ? value : undefined);
    setCountryInitialized(true);
  }, []);

  const handleClassificationChange = useCallback((value: string) => {
    setClassification(value.length ? value : undefined);
  }, []);

  useEffect(() => {
    if (user?.firstName) {
      sendGTMEvent({
        event: "Job Page",
        value: `${user.firstName} viewed Job Page`,
      });
    }
  }, [user?.firstName]);

  // ── Run manager (iframe-mode deck applies + bell + modal) ─────────────────

  const {
    runs,
    modalRunId,
    iframeStageRef,
    enqueueJob,
    openRunModal,
    closeRunModal,
    repositionIframe,
    stopRun,
  } = useRunManager();

  // ── Apply orchestrator (cloud bot + extension sessions for the list view) ──
  // Pass enqueueJob so the extension strategy routes through the serial queue
  // instead of spawning multiple simultaneous iframes/windows.
  const orchestrator = useApplyOrchestrator({ enqueueJob });

  // ── Sync profile to DOM so content-trigger.js can attach it ──────────────
  useEffect(() => {
    if (!user) return;
    const profile = {
      ...buildExtensionProfile(user),
      cv_url: defaultResumeFileUrl,
    };
    try {
      document.body.dataset.cverProfile = JSON.stringify(profile);
    } catch {
      // Non-fatal if body isn't ready
    }
    return () => {
      delete document.body.dataset.cverProfile;
    };
  }, [user, defaultResumeFileUrl]);

  // ── Enhanced orchestrator for the list view ──────────────────────────────
  // Override focusExtTab so that when the agent is stuck in iframe mode the
  // "Help bot finish →" button opens the run modal rather than trying to
  // focus an offscreen window (which doesn't exist for iframe runs).
  const enhancedOrchestrator = {
    ...orchestrator,
    focusExtTab: (jobId: string) => {
      const iframeRun = Array.from(runs.values()).find(
        (r) => r.job?.id === jobId,
      );
      if (iframeRun) {
        openRunModal(iframeRun.id);
      } else {
        orchestrator.focusExtTab(jobId);
      }
    },
  };

  // ── Modal run ─────────────────────────────────────────────────────────────
  const modalRun = modalRunId ? (runs.get(modalRunId) ?? null) : null;

  const { open } = useSidebar();

  return (
    <div className={cn(!open && "flex flex-row gap-4")}>
      <div className={cn(open && "hidden")}>
        <LeftMenu />
      </div>

      <div className="grid grid-cols-1 gap-4 pb-16 flex-1 min-w-0">
        <ReportCard />

        {/* Search + view toggle row */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <JobSearchForm
              onSubmit={handleSearch}
              onLocationChange={handleCountryChange}
              onClassificationChange={handleClassificationChange}
            />
          </div>
        </div>

        <JobList
          query={query}
          localizedTo={localizedTo}
          classification={classification}
          orchestrator={enhancedOrchestrator}
        />
      </div>

      {/* Hidden iframe stage — iframes appended here imperatively by useRunManager */}
      <IframeStage stageRef={iframeStageRef} />

      {/* Run modal overlay — renders the top bar + log panel; iframe is
          positioned by useRunManager's CSS helpers (not inside this tree) */}
      <RunModal
        run={modalRun}
        onClose={closeRunModal}
        onStop={stopRun}
        onLogsToggle={repositionIframe}
      />
    </div>
  );
}
