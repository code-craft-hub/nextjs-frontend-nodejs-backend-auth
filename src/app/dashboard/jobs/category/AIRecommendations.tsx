"use client";

import { ReactNode, useEffect, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, UserCircle } from "lucide-react";
import { sendGTMEvent } from "@next/third-parties/google";

import { userQueries } from "@module/user";
import { useUpdateJobMutation } from "@/lib/mutations/jobs.mutations";
import { useApplyJob } from "@/hooks/useApplyJob";
import { getDataSource } from "@/lib/utils/helpers";
import { queryKeys } from "@/lib/query/keys";
import { JobType } from "@/types";
import { Button } from "@/components/ui/button";

import recommendationsApi, {
  JobRecommendation,
} from "@/lib/api/recommendations.api";
import recommendationsQueries from "@/lib/queries/recommendations.queries";

import { OverviewColumn } from "../components/OverviewColumn";
import { useJobsTable } from "../_hooks/useJobsTable";
import { JobsTable } from "../components/JobsTable";
import { LoadMoreButton } from "../components/LoadMoreButton";
import MobileOverview from "../../../../shared/component/MobileOverview";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Flattens a saved JobRecommendation into the JobType shape that
 * OverviewColumn expects, merging AI-computed scores into the job object.
 */
function toJobRow(rec: JobRecommendation): JobType & {
  matchPercentage?: string;
  recommendationId: string;
  rankPosition: number | null;
} {
  const job = rec.job ?? {};
  return {
    ...(job as JobType),
    id: job.id ?? rec.id,
    matchPercentage:
      rec.matchScore != null ? String(rec.matchScore) : undefined,
    recommendationId: rec.id,
    rankPosition: rec.rankPosition,
  };
}

// ─── Status banners ───────────────────────────────────────────────────────────

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
  const FIELD_LABELS: Record<string, string> = {
    job_title: "job title",
    skills: "skills",
  };

  const missing = (missingFields ?? [])
    .map((f) => FIELD_LABELS[f] ?? f)
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

// ─── Main component ───────────────────────────────────────────────────────────

export const AIRecommendations = ({ children }: { children?: ReactNode }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user } = useQuery(userQueries.detail());
  const userDataSource = getDataSource(user);
  const userJobTitlePreference =
    userDataSource?.key || userDataSource?.title || "";

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

  // ── Data fetching with auto-polling ──────────────────────────────────────
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    ...recommendationsQueries.userRecommendations(),
    initialPageParam: 1,
  });

  // ── Derive pipeline status from last page ────────────────────────────────
  const lastPage = data?.pages[data.pages.length - 1]?.data;
  const pipelineStatus = lastPage?.status;
  const isGenerating = lastPage?.isGenerating ?? false;
  const missingFields = lastPage?.missingFields;
  const generatingMessage = lastPage?.message;
  const totalCount = lastPage?.total ?? 0;

  // ── "Recommend more" mutation ────────────────────────────────────────────
  const generateMoreMutation = useMutation({
    mutationFn: () => recommendationsApi.generateMore(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recommendations.user(),
      });
    },
  });

  // ── Flatten pages → job rows ─────────────────────────────────────────────
  const allJobs = useMemo(
    () =>
      data?.pages.flatMap((page) => page.data.recommendations.map(toJobRow)) ??
      [],
    [data],
  );

  // ── Table ────────────────────────────────────────────────────────────────
  const columns = OverviewColumn({ router, updateJobs, handleApply });
  const table = useJobsTable(allJobs, columns);

  // ── Derived booleans ─────────────────────────────────────────────────────
  const isIncomplete = pipelineStatus === "incomplete_profile";
  const isPipelineActive =
    pipelineStatus === "queued" || pipelineStatus === "processing";
  const hasRecommendations = allJobs.length > 0;
  const hasNoResults =
    !isLoading && !isPipelineActive && !isIncomplete && !hasRecommendations;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="font-inter grid grid-cols-1 w-full overflow-hidden gap-4 xl:gap-8">
      <div className="space-y-4 w-full">
        <h1 className="text-3xl text-center mb-4 font-medium font-inter">
          AI Recommendations
        </h1>

        {children}

        {/* Status banners */}
        {(isPipelineActive || (isGenerating && !isLoading)) && (
          <GeneratingBanner message={generatingMessage} />
        )}
        {isIncomplete && !isLoading && (
          <IncompleteProfileBanner missingFields={missingFields} />
        )}

        <div className="w-full flex flex-col gap-6">
          {/* Desktop table */}
          <JobsTable
            table={table}
            isLoading={isLoading}
            hasNoResults={hasNoResults}
            searchValue={userJobTitlePreference}
            skeletonCount={8}
            onRowClick={(row) => {
              const job = row.original as JobType & {
                id?: string;
                title?: string;
              };
              router.push(
                `/dashboard/jobs/${job.id}?referrer=ai-recommendations&title=${encodeURIComponent(job.title ?? "")}`,
              );
            }}
          />

          {/* Mobile list */}
          <MobileOverview
            allJobs={allJobs}
            updateJobs={updateJobs}
            handleApply={handleApply}
            referrer="ai-recommendations"
          />

          {/* Pagination */}
          <LoadMoreButton
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            label="Load more"
          />

          {/* Recommend more — idle pipeline, recs exist */}
          {pipelineStatus === "ready" && hasRecommendations && (
            <div className="flex flex-col items-center gap-2 pt-4">
              {totalCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {totalCount} recommendation
                  {totalCount !== 1 ? "s" : ""} saved
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
