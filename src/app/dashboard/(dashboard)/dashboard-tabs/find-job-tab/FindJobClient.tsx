"use client";
import { useCallback, useState } from "react";
import { JobSearchForm } from "@/modules/jobs/components/JobSearchForm";
import { JobList } from "@/modules/jobs/components/JobList";
import { ReportCard } from "@/app/dashboard/jobs/components/ReportCard";

export default function JobsPage() {
  const [query, setQuery] = useState<string | undefined>(undefined);

  const handleSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    setQuery(trimmed.length ? trimmed : undefined);
  }, []);

  return (
    <div className="grid grid-cols-1 p-4 md:p-8 gap-4">
      <ReportCard matchPercentage={{}} />
      <JobSearchForm onSubmit={handleSearch} />
      <JobList query={query} />
    </div>
  );
}
