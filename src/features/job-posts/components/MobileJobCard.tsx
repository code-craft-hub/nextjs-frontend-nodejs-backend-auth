"use client";

import { BookmarkIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import type { JobPost } from "@/features/job-posts";
import type { BotSession } from "@/features/browser-automation";

function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

interface Props {
  job: JobPost;
  session: BotSession | undefined;
  onApply: (job: JobPost, e?: React.MouseEvent) => void;
  onResume: (applicationId: string) => void;
  onViewQA: (jobId: string) => void;
  onBookmark: () => void;
  onRowClick: () => void;
}

/**
 * Mobile job card — exact replica of the reference JobCard component.
 * Shows all 5 bot states: default, starting, running, awaiting_human, completed, failed.
 */
export default function MobileJobCard({
  job,
  session: s,
  onApply,
  onResume,
  onViewQA,
  onBookmark,
  onRowClick,
}: Props) {
  const link = job.applyUrl ?? job.link;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 cursor-pointer"
      onClick={onRowClick}
    >
      {/* Company + title */}
      <div className="flex items-start gap-3">
        {job.companyLogo ? (
          <img
            src={job.companyLogo}
            alt={job.companyName ?? ""}
            className="w-11 h-11 rounded-xl object-contain border border-gray-100 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400 shrink-0">
            {(job.companyName ?? "?")[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 capitalize">
            {job.title || "Untitled Role"}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">{job.companyName}</p>
        </div>
        {/* Bookmark */}
        <div
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          className="shrink-0 -mt-1 -mr-1"
        >
          <Toggle
            pressed={job.isBookmarked ?? false}
            aria-label="Toggle bookmark"
            size="sm"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-black data-[state=on]:*:[svg]:stroke-black"
          >
            <BookmarkIcon />
          </Toggle>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {extractDomain(link) && (
          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
            {extractDomain(link)}
          </span>
        )}
        {job.location && (
          <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
            {job.location}
          </span>
        )}
        {job.employmentType && (
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
            {job.employmentType.replace("_", " ")}
          </span>
        )}
        {job.classification && (
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full capitalize">
            {job.classification}
          </span>
        )}
      </div>

      {/* ── State 1: No session ── */}
      {!s && (
        <button
          onClick={(e) => { e.stopPropagation(); onApply(job, e); }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white active:bg-indigo-700 transition-colors"
        >
          {job.emailApply ? "Auto Apply ✦" : "Apply Now"}
        </button>
      )}

      {/* ── State 2: Starting bot ── */}
      {s?.status === "starting" && (
        <button
          disabled
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 text-white flex items-center justify-center gap-2 opacity-80"
        >
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Starting bot…
        </button>
      )}

      {/* ── State 3: Running — Watch Live ── */}
      {(s?.status === "running" || s?.status === "resuming") && (
        <div className="flex flex-col gap-1.5">
          <a
            href={s.liveUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center flex items-center justify-center gap-2 ${
              s.liveUrl ? "bg-indigo-600" : "bg-indigo-400 pointer-events-none"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" />
            Watch Live ↗
          </a>
          {s.lastStepSummary && (
            <p className="text-xs text-gray-400 px-1 line-clamp-2">{s.lastStepSummary}</p>
          )}
        </div>
      )}

      {/* ── State 4: Stuck — Action needed ── */}
      {s?.status === "awaiting_human" && (
        <div className="flex flex-col gap-2">
          {s.liveUrl && (
            <a
              href={s.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-white text-center flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Bot stuck — open browser ↗
            </a>
          )}
          {s.stuckReason && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 leading-relaxed">
              {s.stuckReason}
            </p>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onResume(s.applicationId); }}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 active:bg-gray-200"
          >
            Done — let the bot continue
          </button>
        </div>
      )}

      {/* ── State 5a: Completed ── */}
      {s?.status === "completed" && (
        <div className="flex flex-col gap-1.5">
          <div className="w-full py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white text-center">
            Application submitted ✓
          </div>
          {s.applicationQA && s.applicationQA.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewQA(job.id); }}
              className="w-full py-2 rounded-xl text-xs font-medium text-green-700 bg-green-50 active:bg-green-100"
            >
              View questions &amp; answers →
            </button>
          )}
        </div>
      )}

      {/* ── State 5b: Failed ── */}
      {s?.status === "failed" && (
        <div className="flex flex-col gap-1.5">
          <div className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 text-center border border-red-200">
            Application failed
          </div>
          {s.stuckReason && (
            <p className="text-xs text-red-500 px-1 line-clamp-2">{s.stuckReason}</p>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onApply(job, e); }}
            className="w-full py-2 rounded-xl text-xs font-medium text-gray-600 bg-gray-100 active:bg-gray-200"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
