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
import { JobDeckView } from "./JobDeckView";
import { RunsBellPopover } from "./RunsBellPopover";
import { RunModal } from "./RunModal";
import { IframeStage } from "./IframeStage";
import { useRunManager } from "../hooks/useRunManager";
import { useExtension } from "../hooks/useExtension";
import { buildExtensionProfile, useApplyOrchestrator } from "../hooks/useApplyOrchestrator";
import { resumeApi } from "@/features/resume/api/resume.api";
import { queryKeys } from "@/shared/query/keys";
import type { JobPost } from "@/features/job-posts";
import type { ActiveRun } from "../types/apply-session.types";

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
  const [isDeckView, setIsDeckView] = useState(false);

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
    openRunModal,
    closeRunModal,
    repositionIframe,
    dismissRun,
    stopRun,
  } = useRunManager();

  // ── Apply orchestrator (cloud bot + extension sessions for the list view) ──
  // Lifted here so Overview can merge sessions into the bell popover.
  const orchestrator = useApplyOrchestrator();

  // ── Extension state + apply trigger (same path as the list view) ──────────

  const { state: extState, applyViaExtension } = useExtension();

  // ── Sync profile to DOM so content-trigger.js can attach it ──────────────
  // content-trigger.js reads document.body.dataset.cverProfile and adds it
  // to the auto_apply_trigger payload, making the full profile available to
  // the Gemini agent even when the postMessage payload omits it.
  useEffect(() => {
    if (!user) return;
    const profile = { ...buildExtensionProfile(user), cv_url: defaultResumeFileUrl };
    try {
      document.body.dataset.cverProfile = JSON.stringify(profile);
    } catch {
      // Non-fatal if body isn't ready
    }
    return () => {
      delete document.body.dataset.cverProfile;
    };
  }, [user, defaultResumeFileUrl]);

  // ── Deck apply handler ────────────────────────────────────────────────────
  // Uses the same popup-window path as the list view so clicking the bell
  // entry focuses the live window (no blank iframe problem).
  // Not installed → open the apply URL in a new tab (manual fallback).
  const handleDeckApply = useCallback(
    (job: JobPost) => {
      if (extState === "installed") {
        const profile = user
          ? { ...buildExtensionProfile(user), cv_url: defaultResumeFileUrl }
          : null;
        applyViaExtension({
          id: job.id,
          title: job.title,
          companyName: job.companyName,
          company: job.company,
          location: job.location,
          applyUrl: job.applyUrl,
          link: job.link,
          profile,
        });
      } else {
        const url = job.applyUrl ?? job.link;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    [extState, user, defaultResumeFileUrl, applyViaExtension],
  );

  // ── Active runs for bell popover ─────────────────────────────────────────
  // Merge extension runs (popup/iframe) + cloud bot sessions so the bell
  // shows ALL in-progress applications, not just extension-mode ones.
  const activeRuns = useMemo<ActiveRun[]>(() => {
    // Extension runs (dismissed ones are already removed from the map by dismissRun)
    const extRuns = Array.from(runs.values());

    // Cloud bot sessions — convert ApplySession → ActiveRun shape
    const sessionRuns: ActiveRun[] = Object.values(orchestrator.sessions)
      .filter((s) => !["applied", "failed", "skipped", "recruiter_email"].includes(s.status))
      .map((s) => ({
        id: s.jobId,
        job: { id: s.jobId, title: s.jobTitle ?? "Job", company: s.jobCompany ?? "" },
        jobUrl: s.liveUrl ?? undefined,
        status: (() => {
          switch (s.status) {
            case "routing":
            case "cloud:starting":
            case "ext:queued":    return "loading";
            case "cloud:running":
            case "cloud:resuming":
            case "ext:navigating":
            case "ext:analyzing":
            case "ext:filling":   return "running";
            case "ext:reviewing":
            case "cloud:paused":  return "awaiting_user_input";
            default:              return "running";
          }
        })(),
        openMode: s.strategy === "extension" ? "window" : undefined,
        applicationId: s.applicationId ?? null,
        log: [],
      }));

    return [...extRuns, ...sessionRuns];
  }, [runs, orchestrator.sessions]);

  // ── Modal run ─────────────────────────────────────────────────────────────
  const modalRun = modalRunId ? runs.get(modalRunId) ?? null : null;

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

          <div className="flex items-center gap-2 shrink-0 pb-0.5">
            {/* View toggle */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setIsDeckView(false)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  !isDeckView
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                )}
                title="Table view"
              >
                ≡ List
              </button>
              <button
                onClick={() => setIsDeckView(true)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  isDeckView
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                )}
                title="Deck / swipe view"
              >
                ☰ Deck
              </button>
            </div>

            {/* Bell popover — shows both extension runs and cloud bot sessions */}
            <RunsBellPopover
              runs={activeRuns}
              onOpenRun={(runId) => {
                // Extension runs have a real UUID runId in the runs map;
                // cloud bot session entries use jobId as id — open live URL.
                if (runs.has(runId)) {
                  openRunModal(runId);
                } else {
                  const session = orchestrator.sessions[runId];
                  if (session?.liveUrl) window.open(session.liveUrl, "_blank", "noopener,noreferrer");
                }
              }}
              onDismissRun={(runId) => {
                if (runs.has(runId)) {
                  dismissRun(runId);
                } else {
                  orchestrator.dismissSession(runId);
                }
              }}
            />
          </div>
        </div>

        {/* Main content */}
        {isDeckView ? (
          <JobDeckView
            query={query}
            localizedTo={localizedTo}
            classification={classification}
            onApply={handleDeckApply}
          />
        ) : (
          <JobList
            query={query}
            localizedTo={localizedTo}
            classification={classification}
            orchestrator={orchestrator}
          />
        )}
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
