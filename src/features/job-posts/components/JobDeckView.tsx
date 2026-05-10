"use client";
import JobsAppliedBanner from "./JobsAppliedBanner";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { JobPost } from "@/features/job-posts";
import { Card } from "@/components/ui/card";
import {
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  UserCircle,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import recommendationsQueries from "@/features/recommendations/queries/recommendations.queries";
import type { JobRecommendation } from "@/features/recommendations/api/recommendations.api";
import { coverLetterApi } from "@/features/cover-letter/api/cover-letter.api";
import { resumeApi } from "@/features/resume/api/resume.api";
import { autoApplyApi } from "@/features/auto-apply/api/auto-apply.api";
import { aiSettingsQueries } from "@/features/ai-settings/queries/ai-settings.queries";
import { buildPreviewUrl } from "@/lib/utils/ai-apply-navigation";
import type { ActiveRun } from "../types/apply-session.types";
export type ViewType = "deck" | "list";

interface JobDeckViewProps {
  /** Called when the user swipes/taps Apply on a card. */
  onApply: (job: JobPost) => void;
  /** Called when the user switches between deck and list views. */
  handleViewChange: (value: ViewType) => void;
  runs: Map<string, ActiveRun>;
  onOpenRun: (runId: string) => void;
  onDismissRun: (runId: string) => void;
}

function toJobRow(rec: JobRecommendation): JobPost & {
  matchPercentage?: string;
  recommendationId: string;
  rankPosition: number | null;
} {
  const job = rec.job ?? {};
  return {
    ...(job as JobPost),
    id: job.id ?? rec.id,
    matchPercentage:
      rec.matchScore != null ? String(rec.matchScore) : undefined,
    recommendationId: rec.id,
    rankPosition: rec.rankPosition,
  };
}

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

type SwipeDir = "left" | "right" | null;

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

interface JobDeckCardProps {
  job: JobPost;
  stackIndex: 0 | 1 | 2;
  onSkip: () => void;
  onApply: () => void;
  isApplying?: boolean;
}

function JobDeckCard({
  job,
  stackIndex,
  onSkip,
  onApply,
  isApplying,
}: JobDeckCardProps) {
  const scale = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.96 : 0.92;
  const translateY = stackIndex === 0 ? 0 : stackIndex === 1 ? 12 : 24;
  const opacity = stackIndex === 0 ? 1 : stackIndex === 1 ? 0.85 : 0.7;
  const zIndex = 3 - stackIndex;

  const salaryLabel =
    job.salary ??
    (job.salaryInfo
      ? [
          job.salaryInfo.currency,
          job.salaryInfo.min && job.salaryInfo.max
            ? `${job.salaryInfo.min}–${job.salaryInfo.max}`
            : (job.salaryInfo.min ?? job.salaryInfo.max),
          job.salaryInfo.period ? `/${job.salaryInfo.period}` : "",
        ]
          .filter(Boolean)
          .join("")
      : null);

  const descriptionText =
    job.descriptionText ?? job.companyText ?? "No description available.";
  const preview =
    descriptionText.length > 500
      ? descriptionText.slice(0, 500) + "...."
      : descriptionText;

  return (
    <div
      className="absolute inset-0 transition-all duration-300"
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        zIndex,
      }}
    >
      <Card className="relative w-full rounded-[40px] bg-white shadow-2xl border-0 p-4 lg:p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h1 className="text-xl capitalize  font-bold font-poppins">
            {job.title}
          </h1>

          <div className="flex ml-8 items-center gap-2 pt-3">
            <div className="flex items-center gap-2 text-[#7a7a7a] font-medium text-xl">
              <Clock className="size-6" strokeWidth={2} />
              <span>{timeAgo(job.postedAt ?? job.createdAt)}</span>
            </div>

            {job.link || job.applyUrl ? (
              <a
                href={job.link ?? job.applyUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink
                  className="size-6 text-[#7a7a7a]"
                  strokeWidth={2}
                />
              </a>
            ) : (
              <ExternalLink
                className="w-8.5 h-8.5 text-[#7a7a7a]"
                strokeWidth={2}
              />
            )}
          </div>
        </div>

        {/* Pills */}
        <div className=" flex items-center gap-2 flex-wrap">
          {salaryLabel && (
            <div className="rounded-full bg-[#f2f2f2] px-4 py-2 text-md font-semibold text-black">
              {salaryLabel}
            </div>
          )}
          {job.location && (
            <div className="rounded-full bg-[#f2f2f2] px-4 py-2 text-md font-semibold text-black">
              {job.location}
            </div>
          )}
          {job.emailApply ? (
            <div className="rounded-full bg-[#f2f2f2] px-4 py-2 text-md font-semibold text-black">
              Email Apply
            </div>
          ) : (
            <div className="rounded-full bg-[#f2f2f2] px-4 py-2 text-md font-semibold text-black">
              External Apply
            </div>
          )}
          {job.employmentType && (
            <div className="rounded-full bg-[#f2f2f2] px-4 py-2 text-md font-semibold text-black">
              {job.employmentType}
            </div>
          )}
          {job.jobType && !job.employmentType && (
            <div className="rounded-full bg-[#f2f2f2] px-10 py-5 text-md font-semibold text-black">
              {job.jobType}
            </div>
          )}
        </div>

        {/* Company */}
        <div className=" flex items-center gap-7">
          <div className="w-19.5 h-19.5 rounded-full overflow-hidden bg-gray-200 shrink-0">
            {(job.companyLogo ?? job.companyIcon) ? (
              <img
                src={job.companyLogo ?? job.companyIcon ?? ""}
                alt={job.companyName ?? job.company ?? ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-black text-gray-400">
                {(job.companyName ?? job.company ?? "?")[0]}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="text-xl font-semibold text-black leading-none">
              {job.companyName ?? job.company ?? "Unknown Company"}
            </div>

            {job.location && (
              <div className="mt-3 flex items-center gap-3 text-[#8a8a8a] text-md font-medium">
                <MapPin className="size-5" strokeWidth={2} />
                <span>{job.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-2">
          <div className="text-[#9a9a9a] text-lg font-medium">Description</div>

          <div
            className="mt-2 text-[#2b2b2b] font-medium max-w-215 [&_strong]:font-bold [&_br]:block [&_p]:mt-1"
            dangerouslySetInnerHTML={{ __html: decodeHtml(preview) }}
          />

          <button className="mt-2 font-semibold text-[#2f6df6]">
            See full description
          </button>
        </div>

        {/* Actions — only interactive on the top card */}
        {stackIndex === 0 && (
          <div className="mt-8 flex items-end justify-between px-15">
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={onSkip}
                disabled={isApplying}
                className="size-20 rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Skip"
              >
                <X className="size-10 text-[#ef4444]" strokeWidth={3} />
              </button>
              <div className="text-xl font-black text-black">Ignore</div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={onApply}
                disabled={isApplying}
                className="size-20 rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Auto Apply"
              >
                <Check className="size-10 text-[#22c55e]" strokeWidth={3} />
              </button>
              <div className="text-xl font-black text-black">Auto-Apply</div>
            </div>
          </div>
        )}

        {/* Email-apply generation loading overlay */}
        {isApplying && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85 rounded-[40px] z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-9 animate-spin text-blue-600" />
              <p className="text-sm font-semibold text-gray-700">
                Generating your application…
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export function JobDeckView({
  onApply,
  handleViewChange,
  runs,
  onOpenRun,
  onDismissRun,
}: JobDeckViewProps) {
  const router = useRouter();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...recommendationsQueries.userRecommendations(),
      initialPageParam: 1,
    });

  const { data: settings } = useQuery(aiSettingsQueries.detail());
  const useMasterCv = !!(settings?.useMasterCv && settings?.masterCvId);

  const lastPage = (data?.pages[data.pages.length - 1] as any)?.data;
  const pipelineStatus = lastPage?.status;
  const isGenerating = lastPage?.isGenerating ?? false;
  const missingFields = lastPage?.missingFields;
  const generatingMessage = lastPage?.message;

  const allJobs = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        ((page as any)?.data?.recommendations ?? []).map(toJobRow),
      ) ?? [],
    [data],
  );

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [swipeDir, setSwipeDir] = useState<SwipeDir>(null);
  const [emailApplyingId, setEmailApplyingId] = useState<string | null>(null);

  const deck = allJobs.filter(
    (j) => !appliedIds.has(j.id) && !skippedIds.has(j.id),
  );

  useEffect(() => {
    if (deck.length < 10 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [deck.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleEmailApply = useCallback(
    async (job: JobPost) => {
      setEmailApplyingId(job.id);
      try {
        const jobDescription =
          (job as any).descriptionText ?? (job as any).companyText ?? "";
        const recruiterEmail = (job as any).emailApply ?? "";
        const jobId = job.id;

        let coverLetterId: string;
        let resumeId: string;

        let coverLetterTitle = "Auto Apply";

        if (useMasterCv) {
          const clResponse = await coverLetterApi.generateCoverLetterSync({
            jobDescription,
            recruiterEmail,
            jobId,
          });
          coverLetterId = (clResponse as any).data.id;
          coverLetterTitle = (clResponse as any).data.title || coverLetterTitle;
          resumeId = settings!.masterCvId!;
        } else {
          const [clResponse, resumeResponse] = await Promise.all([
            coverLetterApi.generateCoverLetterSync({
              jobDescription,
              recruiterEmail,
              jobId,
            }),
            resumeApi.autoNewResume(jobDescription),
          ]);
          coverLetterId = (clResponse as any).data.id;
          coverLetterTitle = (clResponse as any).data.title || coverLetterTitle;
          resumeId = (resumeResponse as any).data.id;
        }

        const autoApplyResponse = await autoApplyApi.create({
          id: crypto.randomUUID(),
          resumeId,
          coverLetterId,
          title: coverLetterTitle,
          type: "email",
          recruiterEmail: recruiterEmail || null,
          jobDescription: jobDescription || null,
          status: "draft",
          source: "auto_apply",
        });

        const autoApplyId = (autoApplyResponse as any)?.data?.id;

        const previewUrl = buildPreviewUrl(
          autoApplyId,
          coverLetterId,
          resumeId,
          recruiterEmail,
          useMasterCv ? { masterCvId: settings!.masterCvId! } : undefined,
        );

        setAppliedIds((prev) => new Set([...prev, job.id]));
        router.push(previewUrl);
      } catch {
        toast.error("Failed to generate application. Please try again.");
        setEmailApplyingId(null);
      }
    },
    [useMasterCv, settings, router],
  );

  const handleApply = useCallback(() => {
    const top = deck[0];
    if (!top || emailApplyingId) return;

    if ((top as any).emailApply) {
      handleEmailApply(top);
      return;
    }

    setSwipeDir("right");
    onApply(top);
    setTimeout(() => {
      setAppliedIds((prev) => new Set([...prev, top.id]));
      setSwipeDir(null);
    }, 360);
  }, [deck, onApply, emailApplyingId, handleEmailApply]);

  const handleSkip = useCallback(() => {
    const top = deck[0];
    if (!top || emailApplyingId) return;
    setSwipeDir("left");
    setTimeout(() => {
      setSkippedIds((prev) => new Set([...prev, top.id]));
      setSwipeDir(null);
    }, 360);
  }, [deck, emailApplyingId]);

  const handleReset = useCallback(() => {
    setAppliedIds(new Set());
    setSkippedIds(new Set());
    setSwipeDir(null);
  }, []);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-full max-w-245 h-90 bg-gray-100 rounded-[60px] animate-pulse" />
        <p className="text-sm text-gray-400 animate-pulse">Loading jobs…</p>
      </div>
    );
  }

  // ── Incomplete profile — can't generate recs ────────────────────────────
  if (pipelineStatus === "incomplete_profile" && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto w-full py-12">
        <IncompleteProfileBanner missingFields={missingFields} />
      </div>
    );
  }

  // ── Pipeline active or generating — no recs yet ─────────────────────────
  if (
    (pipelineStatus === "queued" ||
      pipelineStatus === "processing" ||
      isGenerating) &&
    allJobs.length === 0
  ) {
    return (
      <div className="max-w-2xl mx-auto w-full py-12">
        <GeneratingBanner message={generatingMessage} />
      </div>
    );
  }

  // ── Empty — recs generated but none returned ─────────────────────────────
  if (allJobs.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-2">
        <span className="text-4xl">📭</span>
        <p className="text-sm">No recommendations yet. Check back soon.</p>
      </div>
    );
  }

  // ── Deck empty but more pages incoming — show skeleton, not "done" ──────
  if (deck.length === 0 && (isFetchingNextPage || hasNextPage)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-full max-w-245 h-90 bg-gray-100 rounded-[60px] animate-pulse" />
        <p className="text-sm text-gray-400 animate-pulse">
          Loading more jobs…
        </p>
      </div>
    );
  }

  // ── Deck truly exhausted ────────────────────────────────────────────────
  if (deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-4xl">🎉</span>
        <p className="font-medium text-gray-700">You've reviewed all jobs!</p>
        <p className="text-xs text-gray-400">
          {appliedIds.size} applied · {skippedIds.size} skipped
        </p>
        <button
          onClick={handleReset}
          className="mt-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200 transition-colors"
        >
          Start over
        </button>
      </div>
    );
  }

  // ── Deck ────────────────────────────────────────────────────────────────
  const visibleCards = deck.slice(0, 3);

  const topSwipeClass =
    swipeDir === "right"
      ? "translate-x-full opacity-0 rotate-6"
      : swipeDir === "left"
        ? "-translate-x-full opacity-0 -rotate-6"
        : "";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 w-full">
      {/* Generating more — show inline banner while recs are already visible */}
      {(isGenerating ||
        pipelineStatus === "queued" ||
        pipelineStatus === "processing") && (
        <GeneratingBanner message={generatingMessage} />
      )}
      {/* Stats bar */}
      <JobsAppliedBanner
        appliedSize={appliedIds.size}
        runs={[...runs.values()]}
        onOpenRun={onOpenRun}
        onDismissRun={onDismissRun}
      />

      {/* Card stack */}
      <div className="relative w-full max-w-245" style={{ height: 600 }}>
        {[...visibleCards].reverse().map((job, reversedIdx) => {
          const stackIndex = (visibleCards.length - 1 - reversedIdx) as
            | 0
            | 1
            | 2;
          const isTop = stackIndex === 0;
          return (
            <div
              key={job.id}
              className={[
                "absolute inset-0 transition-all duration-300",
                isTop ? topSwipeClass : "",
              ].join(" ")}
            >
              <JobDeckCard
                job={job}
                stackIndex={stackIndex}
                onSkip={handleSkip}
                onApply={handleApply}
                isApplying={isTop && emailApplyingId === job.id}
              />
            </div>
          );
        })}
      </div>
      <div className="w-full flex items-center justify-center">
        <Button
          onClick={() => {
            handleViewChange("list");
          }}
          className="font-poppins rounded-[50px] text-xl p-8"
        >
          Bring your job
        </Button>
      </div>
    </div>
  );
}
