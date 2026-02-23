import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { useCallback } from "react";
import JobsTable from "./JobsTable";
import { useInfiniteJobs } from "../query/job-posts.query";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JobList({ query }: { query?: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPlaceholderData,
  } = useInfiniteJobs(query);

  const handleIntersect = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersectionObserver(
    handleIntersect,
    Boolean(hasNextPage),
  );

  console.log("Rendering JobList with data:", data);
  const allJobs = data?.pages ?? [];
  // const allJobs = data?.pages.flatMap((p) => p.items ?? []) ?? [];

  return (
    // Dim old results while a new search query is in flight
    <div
      style={{
        opacity: isPlaceholderData ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <JobsTable allJobs={allJobs} referrer="jobs" />

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
