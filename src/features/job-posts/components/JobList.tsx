"use client";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useScrollRestoration } from "../hooks/useScrollRestoration";
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
    isLoading,
    isError,
    error,
    refetch,
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

  // Only restore scroll once real (non-placeholder) data for this exact
  // filter combo has rendered — restoring against placeholder/stale rows
  // would scroll to the wrong height.
  useScrollRestoration(!isLoading && !isPlaceholderData && allJobs.length > 0);

  // First-ever fetch for this filter combination — no cached/placeholder
  // data to show yet. Distinguish this from "zero matches" below.
  if (isLoading) {
    return (
      <div className="flex justify-center my-12 text-muted-foreground">
        <Loader className="size-5 animate-spin mr-2" />
        Loading jobs…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 my-12 text-center">
        <p className="text-destructive">
          Couldn't load jobs{error instanceof Error ? `: ${error.message}` : "."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (allJobs.length === 0) {
    return (
      <div className="flex justify-center my-12 text-muted-foreground">
        No jobs match your filters.
      </div>
    );
  }

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
