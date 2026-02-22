"use client";

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
  return useInfiniteQuery({
    queryKey: ["jobs", query],
    queryFn: ({ pageParam }) => fetchJobs({ pageParam, query }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // enabled: query !== undefined,
  });
}

import { useForm } from "react-hook-form";

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
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteJobs(query);

  const handleIntersect = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersectionObserver(
    handleIntersect,
    Boolean(hasNextPage),
  );

  return (
    <>
      {data?.pages.flatMap((page) =>
        page.items.map((job: any, index: number) => (
          <DisplayTable key={`${job.id}-${index}`} job={job} />
        )),
      )}

      {/* Sentinel */}
      <div ref={sentinelRef} />

      {isFetchingNextPage && <div>Loading more…</div>}
    </>
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
      Work hard
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
