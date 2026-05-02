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
import type { JobPost } from "@/features/job-posts";

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
    startIframeApply,
    openRunModal,
    closeRunModal,
    repositionIframe,
    dismissRun,
    stopRun,
  } = useRunManager();

  // ── Extension state (table applies managed by JobsTable's own hook) ────────

  const { state: extState } = useExtension();

  // ── Deck apply handler ────────────────────────────────────────────────────
  // Extension installed → iframe mode (run tracked in bell + modal).
  // Not installed → open the apply URL in a new tab (manual fallback).
  const handleDeckApply = useCallback(
    (job: JobPost) => {
      if (extState === "installed") {
        startIframeApply({
          id: job.id,
          title: job.title,
          company: job.companyName ?? job.company,
          location: job.location,
          applyUrl: job.applyUrl ?? job.link,
        }).catch(console.error);
      } else {
        const url = job.applyUrl ?? job.link;
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    [extState, startIframeApply],
  );

  // ── Active runs for bell popover (not dismissed) ──────────────────────────
  const activeRuns = useMemo(
    () => Array.from(runs.values()).filter((r) => !r.dismissed),
    [runs],
  );

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

            {/* Bell popover for active iframe runs */}
            <RunsBellPopover
              runs={activeRuns}
              onOpenRun={openRunModal}
              onDismissRun={dismissRun}
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
