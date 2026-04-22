"use client";

import { useState } from "react";
import type { JobPost } from "@/features/job-posts";
import type { BotSession } from "@/features/browser-automation";
import type { ExtensionState, ExtJobUpdate } from "@/features/job-posts/hooks/useExtension";

interface Props {
  job: JobPost;
  /** Active backend bot session (mobile / no-extension path). */
  session: BotSession | undefined;
  /** Whether the extension is installed on this Chromium desktop. */
  extState: ExtensionState;
  /** Latest status pushed by the extension for this specific job, if any. */
  extJobStatus: ExtJobUpdate | undefined;
  onApply: (job: JobPost, e?: React.MouseEvent) => void;
  onResume: (applicationId: string) => void;
  onViewQA: (jobId: string) => void;
  onEmailApply: (recruiterEmail: string) => void;
  onExtApply: (job: JobPost) => void;
  /** Brings the hidden automation tab to the foreground. */
  onFocusExtTab: (jobId: string) => void;
}

// ─── Extension job in-progress states ────────────────────────────────────────

function ExtInProgressButton({ label, color }: { label: string; color: string }) {
  return (
    <button
      disabled
      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 whitespace-nowrap opacity-90 ${color}`}
    >
      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
      {label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function JobsTableApplyButton({
  job,
  session: s,
  extState,
  extJobStatus: ext,
  onApply,
  onResume,
  onViewQA,
  onEmailApply,
  onExtApply,
  onFocusExtTab,
}: Props) {
  // Local "dispatched" flag — gives instant feedback before the background responds.
  const [extDispatched, setExtDispatched] = useState(false);

  // ════════════════════════════════════════════════════════════════════════════
  // EXTENSION PATH — only for non-email jobs on Chromium desktop
  // ════════════════════════════════════════════════════════════════════════════

  if (extState === "installed" && !job.emailApply) {
    // ── Navigating to job application page ──────────────────────────────
    if (ext?.status === "navigating") {
      return <ExtInProgressButton label="Opening page…" color="bg-indigo-500" />;
    }

    // ── Gemini is reading the page ───────────────────────────────────────
    if (ext?.status === "analyzing") {
      return <ExtInProgressButton label="Analyzing form…" color="bg-violet-600" />;
    }

    // ── Bot is typing into form fields ───────────────────────────────────
    if (ext?.status === "filling") {
      return <ExtInProgressButton label="Filling form…" color="bg-cyan-600" />;
    }

    // ── Bot is stuck — needs human help ──────────────────────────────────
    if (ext?.status === "stuck") {
      return (
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <button
            onClick={(e) => { e.stopPropagation(); onFocusExtTab(job.id); }}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            Help bot finish →
          </button>
          {ext.stuckReason && (
            <p className="text-2xs text-amber-600 bg-amber-50 rounded-xl px-2 py-1 leading-relaxed line-clamp-2">
              {ext.stuckReason}
            </p>
          )}
        </div>
      );
    }

    // ── Applied successfully ─────────────────────────────────────────────
    if (ext?.status === "applied") {
      return (
        <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-green-600 text-white text-center whitespace-nowrap">
          Applied via extension ✓
        </div>
      );
    }

    // ── Failed (below threshold or error) ────────────────────────────────
    if (ext?.status === "failed") {
      return (
        <div className="flex flex-col gap-1.5 min-w-[130px]">
          <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-red-50 text-red-600 text-center border border-red-200 whitespace-nowrap">
            Extension apply failed
          </div>
          {ext.stuckReason && (
            <p className="text-2xs text-red-500 line-clamp-2 text-right">{ext.stuckReason}</p>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onExtApply(job); }}
            className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      );
    }

    // ── Dispatched but no update from background yet ──────────────────────
    if (extDispatched) {
      return (
        <button disabled className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-500 text-white flex items-center justify-center gap-2 opacity-90 whitespace-nowrap">
          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          Sending to bot…
        </button>
      );
    }

    // ── Default: not yet dispatched ──────────────────────────────────────
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExtDispatched(true);
          onExtApply(job);
        }}
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
      >
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-green-400" />
        </span>
        <span className="text-sm">🧩</span> Apply Now
      </button>
    );
  }

  // ── Chromium but extension not yet installed ──────────────────────────────
  if (extState === "not_installed" && !job.emailApply) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onApply(job, e); }}
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
        title="Install CverAI extension for faster automation"
      >
        <span className="relative flex size-2 shrink-0">
          <span className="relative inline-flex size-2 rounded-full bg-gray-300" />
        </span>
        Apply Now
      </button>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // BACKEND / MOBILE PATH — existing cloud-bot states
  // ════════════════════════════════════════════════════════════════════════════

  // ── No session ────────────────────────────────────────────────────────────
  if (!s) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onApply(job, e); }}
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap"
      >
        {job.emailApply ? "Auto Apply ✦" : "Apply Now"}
      </button>
    );
  }

  // ── Starting bot ─────────────────────────────────────────────────────────
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
            s.liveUrl ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-400 pointer-events-none"
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
