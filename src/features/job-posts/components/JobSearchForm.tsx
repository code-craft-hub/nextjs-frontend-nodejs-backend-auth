"use client";
import { memo } from "react";
import SearchBox from "@/shared/components/SearchBox";

function JobSearchFormImpl({
  onSubmit,
  onLocationChange,
  onClassificationChange,
  onWorkArrangementChange,
  initialQuery,
  country,
  classification,
  workArrangement,
}: {
  onSubmit: (query: string) => void;
  onLocationChange?: (location: string) => void;
  onClassificationChange?: (classification: string) => void;
  onWorkArrangementChange?: (workArrangement: string) => void;
  initialQuery?: string;
  country?: string;
  classification?: string;
  workArrangement?: string;
}) {
  return (
    <SearchBox
      onSubmit={onSubmit}
      onLocationChange={onLocationChange}
      onClassificationChange={onClassificationChange}
      onWorkArrangementChange={onWorkArrangementChange}
      initialQuery={initialQuery}
      country={country}
      classification={classification}
      workArrangement={workArrangement}
    />
  );
}

export const JobSearchForm = memo(JobSearchFormImpl);
