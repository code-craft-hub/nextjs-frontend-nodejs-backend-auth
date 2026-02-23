"use client";

import { useForm } from "react-hook-form";
import { API_URL } from "@/lib/api/client";
import DisplayTable from "@/shared/component/DisplayTable";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

async function fetchJobs({
  pageParam,
  query,
}: {
  pageParam?: string;
  query?: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (pageParam) params.set("cursor", pageParam);

  const r = await fetch(`${API_URL}/job-posts/query?${params}`);
  const data = await r.json();
  console.log("Fetched jobs page:", data);
  return data;
}

export function useInfiniteJobs(query?: string) {
  // core react-query hook result
  const result = useInfiniteQuery({
    // ── REQUIRED ────────────────────────────────────────────────────────────

    // Unique cache key — any change triggers a fresh fetch from page 1
    queryKey: ["jobs", query],

    // Fetcher — receives { pageParam, queryKey, signal, meta }; return one page of data
    queryFn: ({ pageParam }) => fetchJobs({ pageParam, query }),

    // Cursor passed to queryFn on the very first request (no cursor = start of list)
    initialPageParam: undefined,

    // Return the next cursor from the last page; returning undefined stops pagination
    getNextPageParam: (lastPage: any) => lastPage.nextCursor ?? undefined,

    // ── BIDIRECTIONAL PAGINATION ─────────────────────────────────────────────

    // Return the previous cursor from the first page; undefined = no earlier pages
    getPreviousPageParam: (firstPage: any) => firstPage.prevCursor ?? undefined,

    // Cap how many pages are kept in memory; oldest page is dropped when limit is hit
    // maxPages: 10,

    // ── FETCH BEHAVIOR ───────────────────────────────────────────────────────

    // Set to false to prevent the query from running automatically (run via refetch)
    enabled: true,

    // How many times to retry after a failure before surfacing the error
    retry: 3,

    // Delay (ms) between retries; exponential back-off capped at 30 s
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000),

    // Controls when fetching is allowed: 'online' | 'always' | 'offlineFirst'
    networkMode: "online" as const,

    // ── STALENESS & CACHE LIFETIME ───────────────────────────────────────────

    // Data is considered fresh for 5 min — no background refetch within this window
    staleTime: 1000 * 60 * 5,

    // Unused cache entry is garbage-collected after 10 min of inactivity
    gcTime: 1000 * 60 * 10,

    // ── REFETCH TRIGGERS ─────────────────────────────────────────────────────

    // Refetch when the component mounts; 'always' forces it even when data is fresh
    refetchOnMount: true,

    // Refetch when the browser tab regains focus
    refetchOnWindowFocus: true,

    // Refetch when the network comes back online
    refetchOnReconnect: true,

    // Poll every N ms; false = no polling
    refetchInterval: false as const,

    // Allow polling to fire even while the tab is hidden in the background
    refetchIntervalInBackground: false,

    // ── DATA TRANSFORMATION ──────────────────────────────────────────────────

    // Transform data after every fetch; useful to flatten pages or pick fields
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.items),
      pageParams: data.pageParams,
    }),

    // ── PLACEHOLDER & INITIAL DATA ───────────────────────────────────────────

    // Keep the previous query's data visible while the new queryKey is fetching;
    // previousData is undefined on first load so it gracefully falls back to nothing.
    // isPlaceholderData will be true during the transition so you can dim/indicate staleness.
    placeholderData: (previousData: any) => previousData,

    // Pre-seed the cache; treated as real data and skips the loading state entirely
    // initialData: undefined,

    // Timestamp (ms) for initialData; triggers a background refetch if data is stale
    // initialDataUpdatedAt: undefined,

    // ── ERROR HANDLING ────────────────────────────────────────────────────────

    // true = throw errors to the nearest <ErrorBoundary> instead of returning them
    throwOnError: false,

    // ── PERFORMANCE ──────────────────────────────────────────────────────────

    // Only re-render when listed props change; omit to re-render on any change
    // notifyOnChangeProps: ["data", "error"],

    // Reuse previous object references when content is identical — fewer re-renders
    structuralSharing: true,

    // ── METADATA ─────────────────────────────────────────────────────────────

    // Arbitrary bag of data forwarded to queryFn and accessible via query.meta
    meta: { source: "jobs-feed" },
  }) as any; // cast to any so we can re-expose fields explicitly

  // Destructure common/useful fields from the react-query result
  const {
    data,
    error,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isError,
    isFetched,
    isFetchedAfterMount,
    isIdle,
    isLoading,
    isSuccess,
    isFetching,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isRefetching,
    status,
    fetchStatus,
    refetch,
    remove,
    failureCount,
    failureReason,
    isPlaceholderData,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
  } = result;

  // Log everything from TanStack Query in a labeled collapsed group
  console.groupCollapsed("useInfiniteJobs — TanStack Query debug");
  console.log("queryKey:", ["jobs", query]);
  console.log("data (pages & meta):", data);
  console.log("error:", error);
  console.log("fetchNextPage (fn):", fetchNextPage);
  console.log("fetchPreviousPage (fn):", fetchPreviousPage);
  console.log("hasNextPage:", hasNextPage);
  console.log("hasPreviousPage:", hasPreviousPage);
  console.log("isError:", isError);
  console.log("isFetched:", isFetched);
  console.log("isFetchedAfterMount:", isFetchedAfterMount);
  console.log("isIdle:", isIdle);
  console.log("isLoading:", isLoading);
  console.log("isSuccess:", isSuccess);
  console.log("isFetching:", isFetching);
  console.log("isFetchingNextPage:", isFetchingNextPage);
  console.log("isFetchingPreviousPage:", isFetchingPreviousPage);
  console.log("isRefetching:", isRefetching);
  console.log("status:", status);
  console.log("fetchStatus:", fetchStatus);
  console.log("refetch (fn):", refetch);
  console.log("remove (fn):", remove);
  console.log("failureCount:", failureCount);
  console.log("failureReason:", failureReason);
  console.log("isPlaceholderData:", isPlaceholderData);
  console.log("isStale:", isStale);
  console.log("isPaused:", isPaused);
  console.log("dataUpdatedAt (ms):", dataUpdatedAt);
  console.log("errorUpdatedAt (ms):", errorUpdatedAt);
  console.groupEnd();

  // Return the full result plus explicitly exposed fields with one-line comments
  return {
    ...result,
    data, // combined pages and pageParams returned by the query
    error, // last error thrown by the query
    fetchNextPage, // function to fetch the next page
    fetchPreviousPage, // function to fetch the previous page
    hasNextPage, // boolean indicating presence of a next page
    hasPreviousPage, // boolean indicating presence of a previous page
    isError, // true when the query is in error state
    isFetched, // true if the query has been fetched at least once
    isFetchedAfterMount, // true if fetched after component mount
    isIdle, // true when query is idle (not enabled)
    isLoading, // true during the first load
    isSuccess, // true when data was fetched successfully
    isFetching, // true when background fetching is active
    isFetchingNextPage, // true when next page is being fetched
    isFetchingPreviousPage, // true when previous page is being fetched
    isRefetching, // true when a refetch is happening
    status, // overall status: 'idle' | 'loading' | 'error' | 'success'
    fetchStatus, // low-level fetch status: 'idle' | 'fetching' | 'paused'
    refetch, // manual refetch function
    remove, // remove query data from cache
    failureCount, // number of consecutive failures
    failureReason, // last failure reason
    isPlaceholderData, // true if placeholder data is being used
    isStale, // true if cached data is considered stale
    isPaused, // true if query execution is paused
    dataUpdatedAt, // timestamp when data last updated
    errorUpdatedAt, // timestamp when error last updated
  } as any;
}


type SearchForm = {
  query: string;
};

export function JobSearchForm({
  onSubmit,
}: {
  onSubmit: (query: string) => void;
}) {
  const form = useForm<SearchForm>({
    defaultValues: { query: "" },
  });
  const { watch, reset } = form;
  const watched = watch("query");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSubmit(watched?.trim() ?? "");
    }, 300); // debounce 300ms

    return () => clearTimeout(handler);
  }, [watched, onSubmit]);

  return (
    <form
      onSubmit={form.handleSubmit((v) => onSubmit(v.query.trim()))}
      className="flex gap-2 items-center"
    >
      <input
        {...form.register("query")}
        placeholder="Search jobs by title, company, or skills"
        className="px-3 py-2 border rounded-md w-full"
        aria-label="Search jobs"
      />
      <button
        type="button"
        onClick={() => {
          reset({ query: "" });
          onSubmit("");
        }}
        className="px-3 py-2 border rounded-md"
        aria-label="Clear search"
      >
        Clear
      </button>
      <button
        type="submit"
        className="px-3 py-2 bg-primary text-white rounded-md"
      >
        Search
      </button>
    </form>
  );
}

export function JobList({ query }: { query?: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isRefetching,
    // true while previous results are shown and a new query key is still fetching
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
    <div style={{ opacity: isPlaceholderData ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <DisplayTable
        allJobs={allJobs}
        fetchNextPage={fetchNextPage}
        hasNextPage={Boolean(hasNextPage)}
        isLoading={isLoading}
        isFetching={isFetching}
        isRefetching={isRefetching}
        isFetchingNextPage={isFetchingNextPage}
        totalScore={0}
      />

      <div ref={sentinelRef} />

      {isFetchingNextPage && <div>Loading more…</div>}
    </div>
  );
}

export default function JobsPage() {
  const [query, setQuery] = useState<string | undefined>(undefined);

  const handleSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    setQuery(trimmed.length ? trimmed : undefined);
  }, []);

  return (
    <div>
      <JobSearchForm onSubmit={handleSearch} />
      <JobList query={query} />
    </div>
  );
}

export function useIntersectionObserver(
  onIntersect: () => void,
  enabled: boolean,
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        rootMargin: "200px", // prefetch before bottom
      },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return ref;
}
