"use client";
import JobsAppliedBanner from "./JobsAppliedBanner";
import { useState, useCallback, useEffect } from "react";
import { useInfiniteJobs } from "../queries/job-posts.query";
import type { JobPost } from "@/features/job-posts";
import { Card } from "@/components/ui/card";
import { Clock, ExternalLink, MapPin, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
export type ViewType = "deck" | "list";

interface JobDeckViewProps {
  query?: string;
  localizedTo?: string;
  classification?: string;
  /** Called when the user swipes/taps Apply on a card. */
  onApply: (job: JobPost) => void;
  /** Called when the user switches between deck and list views. */
  handleViewChange: (value: ViewType) => void;
}

type SwipeDir = "left" | "right" | null;

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
}

function JobDeckCard({ job, stackIndex, onSkip, onApply }: JobDeckCardProps) {
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
    descriptionText.length > 200
      ? descriptionText.slice(0, 200) + "...."
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
      <Card className="w-full rounded-[40px] bg-white shadow-2xl border-0 p-4 lg:p-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h1 className="text-xl capitalize leading-[1.05] font-bold font-poppins">
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
        <div className=" flex items-center gap-6 flex-wrap">
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
            <div className="text-xl font-normal text-black leading-none">
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

          <p className="mt-2  text-[#2b2b2b] font-medium max-w-215">
            {preview}
          </p>

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
                className="size-20 rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Skip"
              >
                <X className="size-10 text-[#ef4444]" strokeWidth={3} />
              </button>
              <div className="text-xl font-black text-black">Ignore</div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button
                onClick={onApply}
                className="size-20 rounded-full bg-white shadow-[0px_18px_40px_rgba(0,0,0,0.12)] flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Auto Apply"
              >
                <Check className="size-10 text-[#22c55e]" strokeWidth={3} />
              </button>
              <div className="text-xl font-black text-black">Auto-Apply</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export function JobDeckView({
  query,
  localizedTo,
  classification,
  onApply,
  handleViewChange,
}: JobDeckViewProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteJobs(query, undefined, localizedTo, classification);

  const allJobs: JobPost[] = data?.pages ?? [];

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [swipeDir, setSwipeDir] = useState<SwipeDir>(null);

  const deck = allJobs.filter(
    (j) => !appliedIds.has(j.id) && !skippedIds.has(j.id) && !j.emailApply,
  );

  useEffect(() => {
    if (deck.length < 10 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [deck.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleApply = useCallback(() => {
    const top = deck[0];
    if (!top) return;
    setSwipeDir("right");
    onApply(top);
    setTimeout(() => {
      setAppliedIds((prev) => new Set([...prev, top.id]));
      setSwipeDir(null);
    }, 360);
  }, [deck, onApply]);

  const handleSkip = useCallback(() => {
    const top = deck[0];
    if (!top) return;
    setSwipeDir("left");
    setTimeout(() => {
      setSkippedIds((prev) => new Set([...prev, top.id]));
      setSwipeDir(null);
    }, 360);
  }, [deck]);

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

  // ── Empty ───────────────────────────────────────────────────────────────
  if (allJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-2">
        <span className="text-4xl">📭</span>
        <p className="text-sm">No jobs match your filters.</p>
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
      {/* Stats bar */}
      <JobsAppliedBanner appliedSize={appliedIds.size} />
      {/* <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          <strong className="text-green-600">{appliedIds.size}</strong> applied
        </span>
        <span className="text-gray-300">·</span>
        <span>
          <strong>{deck.length}</strong> remaining
        </span>
      </div> */}

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
