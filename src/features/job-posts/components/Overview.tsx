"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

// URL search param names — source of truth for filter state across
// navigation/refresh (Checkpoint 3). Read once on mount; pushed on change.
const PARAM_QUERY = "q";
const PARAM_COUNTRY = "country";
/** Relocation/visa-sponsorship status: "onsite" | "relocation". */
const PARAM_CLASSIFICATION = "relocation";
/** Work location, independent of classification: "remote" | "hybrid" | "onsite". */
const PARAM_WORK_ARRANGEMENT = "workType";

export default function Overview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState<string | undefined>(
    () => searchParams.get(PARAM_QUERY) ?? undefined,
  );
  const [localizedTo, setLocalizedTo] = useState<string | undefined>(
    () => searchParams.get(PARAM_COUNTRY) ?? undefined,
  );
  const [classification, setClassification] = useState<string | undefined>(
    () => searchParams.get(PARAM_CLASSIFICATION) ?? undefined,
  );
  const [workArrangement, setWorkArrangement] = useState<string | undefined>(
    () => searchParams.get(PARAM_WORK_ARRANGEMENT) ?? undefined,
  );
  const [countryInitialized, setCountryInitialized] = useState(
    () => searchParams.get(PARAM_COUNTRY) !== null,
  );

  // Personalization (auto-default country from the user's profile) must
  // never override a filter the user has actually touched — previously this
  // only checked countryInitialized, so picking "Remote" before the profile
  // query resolved would get silently clobbered once it did, producing the
  // "filter appears empty, then jobs show up" race from CT-192 checkpoint 1.
  const hasUserInteractedRef = useRef(searchParams.size > 0);

  const updateUrlParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
    if (defaultCountry && !countryInitialized && !hasUserInteractedRef.current) {
      setLocalizedTo(defaultCountry);
      setCountryInitialized(true);
      updateUrlParam(PARAM_COUNTRY, defaultCountry);
    }
  }, [defaultCountry, countryInitialized, updateUrlParam]);

  const handleSearch = useCallback(
    (value: string) => {
      hasUserInteractedRef.current = true;
      const trimmed = value.trim();
      const next = trimmed.length ? trimmed : undefined;
      setQuery(next);
      updateUrlParam(PARAM_QUERY, next);
    },
    [updateUrlParam],
  );

  const handleCountryChange = useCallback(
    (value: string) => {
      hasUserInteractedRef.current = true;
      const next = value.length ? value : undefined;
      setLocalizedTo(next);
      setCountryInitialized(true);
      updateUrlParam(PARAM_COUNTRY, next);
    },
    [updateUrlParam],
  );

  const handleClassificationChange = useCallback(
    (value: string) => {
      hasUserInteractedRef.current = true;
      const next = value.length ? value : undefined;
      setClassification(next);
      updateUrlParam(PARAM_CLASSIFICATION, next);
    },
    [updateUrlParam],
  );

  const handleWorkArrangementChange = useCallback(
    (value: string) => {
      hasUserInteractedRef.current = true;
      const next = value.length ? value : undefined;
      setWorkArrangement(next);
      updateUrlParam(PARAM_WORK_ARRANGEMENT, next);
    },
    [updateUrlParam],
  );

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
              onWorkArrangementChange={handleWorkArrangementChange}
              initialQuery={query}
              country={localizedTo}
              classification={classification}
              workArrangement={workArrangement}
            />
          </div>
        </div>

        <JobList
          query={query}
          localizedTo={localizedTo}
          classification={classification}
          workArrangement={workArrangement}
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
