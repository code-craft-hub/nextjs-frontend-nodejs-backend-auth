"use client";

import type { JobPost } from "@/features/job-posts";
import type { BotSession } from "@/features/browser-automation";
import type { ExtensionState } from "@/features/job-posts/hooks/useExtension";

interface Props {
  job: JobPost;
  session: BotSession | undefined;
  /** Whether this browser can have the extension installed. */
  extState: ExtensionState;
  /** True after the user clicked "Apply Now" and we dispatched to the extension. */
  extDispatched: boolean;
  onApply: (job: JobPost, e?: React.MouseEvent) => void;
  onResume: (applicationId: string) => void;
  onViewQA: (jobId: string) => void;
  onEmailApply: (recruiterEmail: string) => void;
  onExtApply: (job: JobPost) => void;
}

/**
 * Desktop apply button — three top-level paths:
 *  1. Extension installed (non-email job)  → delegates to extension sidepanel
 *  2. Backend bot session active           → shows 5-state bot UI
 *  3. Mobile / no extension / email job   → uses existing backend/email flow
 */
export function JobsTableApplyButton({
  job,
  session: s,
  extState,
  extDispatched,
  onApply,
  onResume,
  onViewQA,
  onEmailApply,
  onExtApply,
}: Props) {
  // ── Extension already dispatched — waiting for sidepanel ─────────────────
  if (extDispatched && !s) {
    return (
      <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 text-center border border-indigo-200 whitespace-nowrap">
        Check extension panel →
      </div>
    );
  }

  // ── No active session ─────────────────────────────────────────────────────
  if (!s) {
    if (extState === "installed" && !job.emailApply) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onExtApply(job); }}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <span>🧩</span> Apply Now
        </button>
      );
    }

    return (
      <button
        onClick={(e) => { e.stopPropagation(); onApply(job, e); }}
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap"
      >
        {job.emailApply ? "Auto Apply ✦" : "Apply Now"}
      </button>
    );
  }

  // ── Starting bot ──────────────────────────────────────────────────────────
  if (s.status === "starting") {
    return (
      <button
        disabled
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-500 text-white flex items-center justify-center gap-2 opacity-80 whitespace-nowrap"
      >
        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
        Starting bot…
      </button>
    );
  }

  // ── Running / resuming ────────────────────────────────────────────────────
  if (s.status === "running" || s.status === "resuming") {
    return (
      <div className="flex flex-col items-end gap-1 min-w-[130px]">
        <a
          href={s.liveUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold text-white text-center flex items-center justify-center gap-2 whitespace-nowrap ${
            s.liveUrl
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-indigo-400 pointer-events-none"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse shrink-0" />
          Watch Live ↗
        </a>
        {s.lastStepSummary && (
          <p className="text-2xs text-gray-400 max-w-[130px] truncate text-right">
            {s.lastStepSummary}
          </p>
        )}
      </div>
    );
  }

  // ── Stuck — awaiting human ────────────────────────────────────────────────
  if (s.status === "awaiting_human") {
    return (
      <div className="flex flex-col gap-1.5 min-w-[130px]">
        {s.liveUrl && (
          <a
            href={s.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500 text-white text-center flex items-center justify-center gap-2 whitespace-nowrap hover:bg-amber-600"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            Bot stuck — open browser ↗
          </a>
        )}
        {s.stuckReason && (
          <p className="text-2xs text-amber-600 bg-amber-50 rounded-xl px-2 py-1 leading-relaxed line-clamp-2">
            {s.stuckReason}
          </p>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onResume(s.applicationId); }}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
        >
          Done — let the bot continue
        </button>
      </div>
    );
  }

  // ── Completed ─────────────────────────────────────────────────────────────
  if (s.status === "completed") {
    return (
      <div className="flex flex-col gap-1.5 min-w-[130px]">
        <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-green-600 text-white text-center whitespace-nowrap">
          Application submitted ✓
        </div>
        {s.applicationQA && s.applicationQA.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewQA(job.id); }}
            className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium text-green-700 bg-green-50 hover:bg-green-100 whitespace-nowrap"
          >
            View questions &amp; answers →
          </button>
        )}
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (s.status === "failed") {
    return (
      <div className="flex flex-col gap-1.5 min-w-[130px]">
        <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-red-50 text-red-600 text-center border border-red-200 whitespace-nowrap">
          Application failed
        </div>
        {s.stuckReason && (
          <p className="text-2xs text-red-500 line-clamp-1 text-right">{s.stuckReason}</p>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onApply(job, e); }}
          className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Recruiter email found — no form on site ───────────────────────────────
  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 text-center border border-blue-200 whitespace-nowrap">
        Recruiter email found
      </div>
      {s.recruiterEmail && (
        <p className="text-2xs text-blue-600 font-mono truncate text-right">{s.recruiterEmail}</p>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); s.recruiterEmail && onEmailApply(s.recruiterEmail); }}
        className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
      >
        Send Email Application ✦
      </button>
    </div>
  );
}
