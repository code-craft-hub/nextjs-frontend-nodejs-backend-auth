"use client";
import SearchBox from "@/shared/components/SearchBox";

export function JobSearchForm({
  onSubmit,
  onLocationChange,
}: {
  onSubmit: (query: string) => void;
  onLocationChange?: (location: string) => void;
}) {
  return <SearchBox onSubmit={onSubmit} onLocationChange={onLocationChange} />;
}
