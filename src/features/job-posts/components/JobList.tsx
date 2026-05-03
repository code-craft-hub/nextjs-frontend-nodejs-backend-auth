"use client";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useCallback } from "react";
import JobsTable from "./JobsTable";
import { useInfiniteJobs } from "../queries/job-posts.query";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UseApplyOrchestrator } from "@/features/job-posts/hooks/useApplyOrchestrator";

export function JobList({
  query,
  location,
  localizedTo,
  classification,
  orchestrator,
}: {
  query?: string;
  location?: string;
  localizedTo?: string;
  classification?: string;
  orchestrator: UseApplyOrchestrator;
}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPlaceholderData,
  } = useInfiniteJobs(query, location, localizedTo, classification);

  const handleIntersect = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersectionObserver(
    handleIntersect,
    Boolean(hasNextPage),
  );

  const allJobs = data?.pages ?? [];

  return (
    <div
      style={{
        opacity: isPlaceholderData ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <JobsTable allJobs={allJobs} referrer="jobs" orchestrator={orchestrator} />

      <div ref={sentinelRef} />

      {isFetchingNextPage && (
        <div className="flex justify-center my-4">
          <Button
            variant={"outline"}
            className="flex items-center justify-center p-4"
          >
            <Loader className="size-4 animate-spin" />
            Loading more jobs…
          </Button>
        </div>
      )}
    </div>
  );
}
