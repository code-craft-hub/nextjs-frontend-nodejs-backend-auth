"use client";
import { useCallback, useState } from "react";
import { JobSearchForm } from "@/features/job-posts/components/JobSearchForm";
import { JobList } from "@/features/job-posts/components/JobList";
import { IframeStage } from "@/features/job-posts/components/IframeStage";
import { ReportCard } from "@/features/jobs/components/ReportCard";
import { useApplyOrchestrator } from "@/features/job-posts/hooks/useApplyOrchestrator";
import { useRunManager } from "@/features/job-posts/hooks/useRunManager";

export default function JobsPage() {
  const { iframeStageRef, startIframeApply, startPopupApply } = useRunManager();
  const orchestrator = useApplyOrchestrator({ startIframeApply, startPopupApply });
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [localizedTo, setLocalizedTo] = useState<string | undefined>(undefined);
  const [classification, setClassification] = useState<string | undefined>(undefined);

  const handleSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    setQuery(trimmed.length ? trimmed : undefined);
  }, []);

  const handleCountryChange = useCallback((value: string) => {
    setLocalizedTo(value.length ? value : undefined);
  }, []);

  const handleClassificationChange = useCallback((value: string) => {
    setClassification(value.length ? value : undefined);
  }, []);

  return (
    <div className="grid grid-cols-1 p-4 md:p-8 gap-4">
      <ReportCard />
      <JobSearchForm
        onSubmit={handleSearch}
        onLocationChange={handleCountryChange}
        onClassificationChange={handleClassificationChange}
      />
      <JobList query={query} localizedTo={localizedTo} classification={classification} orchestrator={orchestrator} />
      <IframeStage stageRef={iframeStageRef} />
    </div>
  );
}
