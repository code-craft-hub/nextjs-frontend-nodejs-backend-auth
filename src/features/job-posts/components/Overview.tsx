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
import { RunManagerProvider, useRunManagerContext } from "./RunManagerProvider";
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

// Owns useApplyOrchestrator (sessions ticks on every extension/cloud-bot
// status update) so that state lives right above JobList instead of in
// OverviewContent — only the list re-renders when a session updates, not
// the search form / sidebar / report card.
function JobListSection({
  query,
  localizedTo,
  classification,
  workArrangement,
}: {
  query?: string;
  localizedTo?: string;
  classification?: string;
  workArrangement?: string;
}) {
  const { enqueueJob, openRunModal, getRuns } = useRunManagerContext();

  // Pass enqueueJob so the extension strategy routes through the serial
  // queue instead of spawning multiple simultaneous iframes/windows.
  const orchestrator = useApplyOrchestrator({ enqueueJob });

  // Override focusExtTab so that when the agent is stuck in iframe mode the
  // "Help bot finish →" button opens the run modal rather than trying to
  // focus an offscreen window (which doesn't exist for iframe runs).
  const enhancedOrchestrator = useMemo(
    () => ({
      ...orchestrator,
      focusExtTab: (jobId: string) => {
        const iframeRun = Array.from(getRuns().values()).find(
          (r) => r.job?.id === jobId,
        );
        if (iframeRun) {
          openRunModal(iframeRun.id);
        } else {
          orchestrator.focusExtTab(jobId);
        }
      },
    }),
    [orchestrator, openRunModal, getRuns],
  );

  return (
    <JobList
      query={query}
      localizedTo={localizedTo}
      classification={classification}
      workArrangement={workArrangement}
      orchestrator={enhancedOrchestrator}
    />
  );
}

function OverviewContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  console.count("Overview mount");
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

  // True while `localizedTo` reflects the profile auto-default rather than
  // an explicit pick. Relocation listings are tagged by destination country,
  // not the user's home country, so a silently auto-defaulted home-country
  // filter (e.g. Nigeria, the platform's home market) would hide every
  // relocation result and look like a broken filter — see handleClassificationChange.
  const isCountryAutoDefaultedRef = useRef(false);

  const updateUrlParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const updateUrlParam = useCallback(
    (key: string, value: string | undefined) => updateUrlParams({ [key]: value }),
    [updateUrlParams],
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
      isCountryAutoDefaultedRef.current = true;
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
      isCountryAutoDefaultedRef.current = false;
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

      // Relocation listings are tagged by destination country, not the
      // user's home country — clear an auto-defaulted (never explicitly
      // chosen) country filter so it doesn't silently zero out every result.
      if (next === "relocation" && isCountryAutoDefaultedRef.current && localizedTo) {
        isCountryAutoDefaultedRef.current = false;
        setLocalizedTo(undefined);
        setCountryInitialized(true);
        updateUrlParams({ [PARAM_CLASSIFICATION]: next, [PARAM_COUNTRY]: undefined });
        return;
      }

      updateUrlParam(PARAM_CLASSIFICATION, next);
    },
    [updateUrlParam, updateUrlParams, localizedTo],
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

        <JobListSection
          query={query}
          localizedTo={localizedTo}
          classification={classification}
          workArrangement={workArrangement}
        />
      </div>
    </div>
  );
}

export default function Overview() {
  return (
    <RunManagerProvider>
      <OverviewContent />
    </RunManagerProvider>
  );
}
