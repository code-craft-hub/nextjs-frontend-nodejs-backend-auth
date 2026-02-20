"use client";

import { memo, useMemo } from "react";
import FindJobClient from "./FindJobClient";
import type { JobFilters } from "@/lib/types/jobs";
import { getJobColumns } from "./find-job-columns";
import { useJobActions } from "./hooks/useJobActions";

export const FindJob = memo(({ filters }: { filters: JobFilters }) => {
  const { handleBookmark, handleApply } = useJobActions();

  /**
   * Columns are memoized so the table instance is stable across renders.
   * handleBookmark and handleApply are stable references (useCallback in the hook),
   * so this memo only recreates when the callbacks actually change.
   */
  const columns = useMemo(
    () => getJobColumns({ onBookmark: handleBookmark, onApply: handleApply }),
    [handleBookmark, handleApply]
  );

  return (
    <div className="flex flex-col font-poppins h-screen relative">
      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-8">
        AI Job Recommendation
      </h1>
      <div className="grid pb-16">
        <FindJobClient columns={columns} filters={filters} />
      </div>
    </div>
  );
});

FindJob.displayName = "FindJob";
