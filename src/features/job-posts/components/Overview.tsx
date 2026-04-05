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
// import AdvancedFilterModal from "@/features/jobs/components/AdvancedFilterModal";

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
  const [classification, setClassification] = useState<string | undefined>(undefined);
  const [countryInitialized, setCountryInitialized] = useState(false);

  const { data: user } = useQuery(userQueries.detail());

  // Derive the user's canonical country from the React Query cache — no extra fetch.
  const defaultCountry = useMemo(
    () => resolveCountry(user?.country),
    [user?.country],
  );

  // Apply the user's registered country as the default filter exactly once,
  // before the user has made any explicit choice.
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

  // FilterLocation now emits canonical country names (e.g. "Nigeria", "United States").
  // Route directly to localizedTo — exact-match index, no ILIKE needed.
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

  const { open } = useSidebar();

  return (
    <div className={cn(!open && "flex flex-row gap-4")}>
      <div className={cn(open && "hidden")}>
        <LeftMenu />
      </div>
      <div className="grid grid-cols-1 gap-4 pb-16">
        <ReportCard />
        <JobSearchForm
          onSubmit={handleSearch}
          onLocationChange={handleCountryChange}
          onClassificationChange={handleClassificationChange}
        />
        {/* <AdvancedFilterModal
          initialCountry={localizedTo}
          initialClassification={classification}
          onApplyFilters={handleApplyFilters}
        /> */}
        <JobList
          query={query}
          localizedTo={localizedTo}
          classification={classification}
        />
      </div>
    </div>
  );
}