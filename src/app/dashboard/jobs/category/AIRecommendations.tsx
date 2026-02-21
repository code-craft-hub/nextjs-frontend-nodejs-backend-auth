"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { userQueries } from "@module/user";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getDataSource } from "@/lib/utils/helpers";
import MobileOverview from "../components/MobileOverview";
import { sendGTMEvent } from "@next/third-parties/google";
import {
  OverviewColumn,
  OverviewEmpty,
  OverviewSkeleton,
} from "../components/OverviewColumn";
import { useApplyJob } from "@/hooks/useApplyJob";
import recommendationsApi, {
  JobRecommendation,
} from "@/lib/api/recommendations.api";
import recommendationsQueries from "@/lib/queries/recommendations.queries";
import { queryKeys } from "@/lib/query/keys";
import { JobType } from "@/types";
import { Loader2, RefreshCw, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Flatten a saved JobRecommendation into the JobType shape that OverviewColumn
 * expects, merging AI-computed scores into the job object.
 */
function toJobRow(rec: JobRecommendation): JobType & {
  matchPercentage?: string;
  recommendationId: string;
  rankPosition: number | null;
} {
  const job = rec.job ?? {};
  return {
    ...(job as JobType),
    id: job.id ?? rec.id,           // fall back to recommendation id if job has none
    matchPercentage: rec.matchScore != null ? String(rec.matchScore) : undefined,
    recommendationId: rec.id,
    rankPosition: rec.rankPosition,
  };
}

// ---------------------------------------------------------------------------
// Status UI components
// ---------------------------------------------------------------------------

function GeneratingBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-blue-700">
      <Loader2 className="size-4 shrink-0 animate-spin" />
      <p className="text-sm">
        {message ??
          "Finding the best job matches for you. New recommendations will appear shortly…"}
      </p>
    </div>
  );
}

function IncompleteProfileBanner({
  missingFields,
}: {
  missingFields?: string[];
}) {
  const fieldLabels: Record<string, string> = {
    job_title: "job title",
    skills: "skills",
  };

  const missing = (missingFields ?? [])
    .map((f) => fieldLabels[f] ?? f)
    .join(" and ");

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-orange-100 bg-orange-50 px-6 py-8 text-center text-orange-700">
      <UserCircle className="size-10 opacity-70" />
      <div>
        <p className="font-medium">Complete your profile to get started</p>
        {missing && (
          <p className="mt-1 text-sm text-orange-600">
            Please add your {missing} to receive personalized recommendations.
          </p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="border-orange-300 text-orange-700 hover:bg-orange-100"
        onClick={() => (window.location.href = "/dashboard/profile")}
      >
        Complete Profile
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const AIRecommendations = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery(userQueries.detail());
  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    if (user?.firstName) {
      sendGTMEvent({
        event: "AI Recommendations Page",
        value: `${user.firstName} viewed AI Recommendations Page`,
      });
    }
  }, [user?.firstName]);

  const updateJobs = useUpdateJobMutation();
  const { applyToJob: handleApply } = useApplyJob();

  // ── Infinite query (with auto-polling via refetchInterval) ─────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery(recommendationsQueries.userRecommendations());

  // ── Derive status from the last fetched page ───────────────────────────────
  const lastPage = data?.pages[data.pages.length - 1]?.data;
  const pipelineStatus = lastPage?.status;
  const isGenerating = lastPage?.isGenerating ?? false;
  const missingFields = lastPage?.missingFields;
  const generatingMessage = lastPage?.message;
  const totalCount = lastPage?.total ?? 0;

  // ── "Recommend more" mutation ──────────────────────────────────────────────
  const generateMoreMutation = useMutation({
    mutationFn: () => recommendationsApi.generateMore(),
    onSuccess: () => {
      // Force a refetch so the query immediately sees isGenerating: true
      // and the refetchInterval starts polling.
      queryClient.invalidateQueries({
        queryKey: queryKeys.recommendations.user(),
      });
    },
  });

  // ── Flatten all pages into a single job list ───────────────────────────────
  const allJobs = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page.data.recommendations.map(toJobRow),
      ) ?? [],
    [data],
  );

  // ── Table setup ────────────────────────────────────────────────────────────
  const columns = OverviewColumn({ router, updateJobs, handleApply });

  const table = useReactTable({
    data: allJobs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  const visibleRows = table.getRowModel().rows;

  // ── Derived booleans ───────────────────────────────────────────────────────
  const isInitialLoading = isLoading;
  const isIncomplete = pipelineStatus === "incomplete_profile";
  const isPipelineActive =
    pipelineStatus === "queued" || pipelineStatus === "processing";
  const hasRecommendations = allJobs.length > 0;
  const hasNoResults =
    !isInitialLoading &&
    !isPipelineActive &&
    !isIncomplete &&
    !hasRecommendations;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="font-inter grid grid-cols-1 w-full overflow-hidden gap-4 xl:gap-8">
      <div className="space-y-4 w-full">
        <h1 className="text-3xl text-center mb-4 font-medium font-inter">
          AI Recommendations
        </h1>

        {children}

        {/* Status banners */}
        {(isPipelineActive || (isGenerating && !isInitialLoading)) && (
          <GeneratingBanner message={generatingMessage} />
        )}
        {isIncomplete && !isInitialLoading && (
          <IncompleteProfileBanner missingFields={missingFields} />
        )}

        <div className="w-full flex flex-col gap-6">
          {/* Desktop table */}
          <div className="overflow-hidden border-none hidden lg:grid grid-cols-1">
            <Table>
              <TableBody>
                {isInitialLoading ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <OverviewSkeleton key={i} />
                    ))}
                  </div>
                ) : hasNoResults ? (
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    <OverviewEmpty searchValue={userJobTitlePreference} />
                  </div>
                ) : (
                  visibleRows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-white border-b rounded-3xl! hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
                      onClick={() => {
                        const original = row.original as JobType & {
                          id?: string;
                          title?: string;
                        };
                        router.push(
                          `/dashboard/jobs/${original.id}?referrer=ai-recommendations&title=${encodeURIComponent(original.title ?? "")}`,
                        );
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile list */}
          <MobileOverview
            allJobs={allJobs}
            updateJobs={updateJobs}
            handleApply={handleApply}
          />

          {/* Load more pages (infinite scroll trigger) */}
          {hasNextPage && (
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}

          {/* Recommend more — shown when the pipeline is idle and recs exist */}
          {pipelineStatus === "ready" && hasRecommendations && (
            <div className="flex flex-col items-center gap-2 pt-4">
              {totalCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {totalCount} recommendation{totalCount !== 1 ? "s" : ""} saved
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={
                  generateMoreMutation.isPending || isGenerating || isFetching
                }
                onClick={() => generateMoreMutation.mutate()}
                className="gap-2"
              >
                {generateMoreMutation.isPending || isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Finding more jobs…
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    Recommend more jobs
                  </>
                )}
              </Button>
              {generateMoreMutation.isError && (
                <p className="text-xs text-destructive">
                  Failed to queue generation. Please try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
