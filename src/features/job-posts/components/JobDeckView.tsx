"use client";

import { useState, useCallback } from "react";
import { useInfiniteJobs } from "../queries/job-posts.query";
import type { JobPost } from "@/features/job-posts";
import { JobCard } from "./JobCard";

interface JobDeckViewProps {
  query?: string;
  localizedTo?: string;
  classification?: string;
  /** Called when the user swipes/taps Apply on a card. */
  onApply: (job: JobPost) => void;
}

type SwipeDir = "left" | "right" | null;

export function JobDeckView({
  query,
  localizedTo,
  classification,
  onApply,
}: JobDeckViewProps) {
  const { data, isLoading } = useInfiniteJobs(
    query,
    undefined,
    localizedTo,
    classification,
  );

  const allJobs: JobPost[] = data?.pages ?? [];

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [swipeDir, setSwipeDir] = useState<SwipeDir>(null);

  const deck = allJobs.filter(
    (j) => !appliedIds.has(j.id) && !skippedIds.has(j.id),
  );

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
        <div className="w-full max-w-md h-[360px] bg-gray-100 rounded-2xl animate-pulse" />
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

  // ── Deck exhausted ──────────────────────────────────────────────────────
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

  // Swipe classes for the top card
  const topSwipeClass =
    swipeDir === "right"
      ? "translate-x-full opacity-0 rotate-6"
      : swipeDir === "left"
        ? "-translate-x-full opacity-0 -rotate-6"
        : "";

  return (
    <div className="flex flex-col items-center gap-6 pt-2 pb-8">
      {/* Stats bar */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          <strong className="text-green-600">{appliedIds.size}</strong> applied
        </span>
        <span className="text-gray-300">·</span>
        <span>
          <strong>{deck.length}</strong> remaining
        </span>
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm" style={{ height: 400 }}>
        {/* Render from back to front so top card is on top of DOM */}
        {[...visibleCards]
          .reverse()
          .map((job, reversedIdx) => {
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
                <JobCard job={job} stackIndex={stackIndex} />
              </div>
            );
          })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-5">
        <button
          onClick={handleSkip}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-white border-2 border-gray-200 text-gray-400 text-lg hover:border-red-300 hover:text-red-400 hover:shadow-md active:scale-95 transition-all shadow-sm"
          title="Skip this job"
          aria-label="Skip"
        >
          ✕
        </button>

        <button
          onClick={handleApply}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white text-xl hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all shadow-lg"
          title="Auto-apply to this job"
          aria-label="Auto Apply"
        >
          🤖
        </button>
      </div>

      <p className="text-xs text-gray-400">← Skip · Apply 🤖</p>
    </div>
  );
}
