"use client";
import SearchBox from "@/shared/components/SearchBox";

export function JobSearchForm({
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
