"use client";
import SearchBox from "@/shared/components/SearchBox";

export function JobSearchForm({
  onSubmit,
  onLocationChange,
  onClassificationChange,
}: {
  onSubmit: (query: string) => void;
  onLocationChange?: (location: string) => void;
  onClassificationChange?: (classification: string) => void;
}) {
  return (
    <SearchBox
      onSubmit={onSubmit}
      onLocationChange={onLocationChange}
      onClassificationChange={onClassificationChange}
    />
  );
}
