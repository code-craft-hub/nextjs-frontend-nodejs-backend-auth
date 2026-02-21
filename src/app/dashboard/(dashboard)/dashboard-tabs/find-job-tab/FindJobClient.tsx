"use client";

import { Loader2, Search, X } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { JobPost } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useState,
  useDeferredValue,
} from "react";
import { Button } from "@/components/ui/button";
import type { JobFilters } from "@/lib/types/jobs";
import { ReportCard } from "@/app/dashboard/jobs/components/ReportCard";
import { useRouter } from "next/navigation";
import MobileFindJob from "./MobileFindJob";
import { jobPostsQueries } from "@/lib/queries/job-posts.queries";

interface FindJobClientProps {
  columns: ColumnDef<JobPost>[];
  filters: Omit<JobFilters, "page">;
  hideToMenus?: boolean;
}

export default function FindJobClient({
  columns,
  filters,
  hideToMenus,
}: FindJobClientProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] =
    useState<Omit<JobFilters, "page">>(filters);

  /**
   * useDeferredValue schedules the filter computation at low React priority so
   * the input stays lag-free even with thousands of jobs in memory. The UI
   * shows the previous filtered list while the deferred computation runs — no
   * artificial debounce delay, just React's concurrent scheduler.
   */
  const deferredQuery = useDeferredValue(searchQuery);
  const isSearchPending = searchQuery !== deferredQuery;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(jobPostsQueries.infinite(searchFilters));

  /**
   * Debounce: 300ms after the user stops typing, push the search term into
   * searchFilters to trigger a fresh server-side ilike query. React Query
   * caches by key, so re-typing a previous query reuses cached results.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchFilters((prev) => ({
        ...prev,
        title: searchQuery.trim() || undefined,
      }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  /**
   * Flatten all fetched pages into a single job array.
   * `isBookmarked` is set server-side via the authenticated list endpoint —
   * no client-side decoration or extra bookmark API call required.
   */
  const allJobs = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  /**
   * Instant local filter powered by the deferred search query.
   * Searches title, company name, and location so users can find a job
   * regardless of which field they know. The computation is non-blocking
   * because it's driven by deferredQuery (low-priority concurrent update).
   */
  const filteredJobs = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return allJobs;
    return allJobs.filter(
      (job) =>
        job.title?.toLowerCase().includes(q) ||
        job.companyName?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q)
    );
  }, [allJobs, deferredQuery]);

  const table = useReactTable({
    data: filteredJobs,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  /**
   * Auto-fetch: when the current pages have no local matches for the active
   * query, silently fetch the next page. Because searchFilters.title is already
   * updated (debounced), the server returns pre-filtered results — each page
   * load is meaningful rather than wasted traffic.
   */
  const filteredCount = filteredJobs.length;

  useEffect(() => {
    if (!deferredQuery.trim() || isFetchingNextPage || !hasNextPage) return;
    if (filteredCount === 0) fetchNextPage();
  }, [
    deferredQuery,
    filteredCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const visibleRows = table.getRowModel().rows;

  return (
    <div className="w-full flex flex-col gap-6">
      {!hideToMenus && <ReportCard />}

      {/* Instant search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, company, or location..."
          className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
        {searchQuery && !isSearchPending && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        )}
        {isSearchPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-gray-400 pointer-events-none" />
        )}
      </div>

      <span className="text-sm text-gray-500">
        {filteredCount > 0 ? `${filteredCount} jobs` : "All Jobs"}
      </span>

      {/* Desktop table — hidden below lg */}
      <div className="hidden lg:grid grid-cols-1">
        <Table>
          <TableBody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-white border-b hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/dashboard/jobs/${row.original.id}?referrer=dashboard&title=${row.original.title}`
                    )
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoading || isFetchingNextPage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching for jobs...</span>
                    </div>
                  ) : !hasNextPage ? (
                    <span>No results found.</span>
                  ) : (
                    <span>Loading...</span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list — visible below lg */}
      <MobileFindJob allJobs={filteredJobs} />

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More Jobs"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
