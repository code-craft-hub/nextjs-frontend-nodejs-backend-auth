"use client";
import SearchBox from "@/shared/components/SearchBox";

export function JobSearchForm({
  onSubmit,
  onLocationChange,
  onClassificationChange,
  initialQuery,
  country,
  classification,
}: {
  onSubmit: (query: string) => void;
  onLocationChange?: (location: string) => void;
  onClassificationChange?: (classification: string) => void;
  initialQuery?: string;
  country?: string;
  classification?: string;
}) {
  return (
    <SearchBox
      onSubmit={onSubmit}
      onLocationChange={onLocationChange}
      onClassificationChange={onClassificationChange}
      initialQuery={initialQuery}
      country={country}
      classification={classification}
    />
  );
}
