"use client";

import type { JobPost } from "@/features/job-posts";
import type { ExtensionState } from "@/features/job-posts/hooks/useExtension";
import type { ApplySession } from "@/features/job-posts/types/apply-session.types";

interface Props {
  job: JobPost;
  session: ApplySession | undefined;
  extState: ExtensionState;
  /** Pre-bound to this job by JobsTableRow — no job arg needed. */
  onApply: () => void;
  onResume: () => void;
  onViewQA: () => void;
  onEmailApply: (recruiterEmail: string, jobId?: string) => void;
  onFocusExtTab: () => void;
  /** Ask the bell to open pre-expanded on the run for this job. */
  onAttention: () => void;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Spinner() {
  return (
    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
  );
}

function SpinnerButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  /** When provided, the button focuses the hidden automation tab on click. */
  onClick?: () => void;
}) {
  return (
    <button
      disabled={!onClick}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(); } : undefined}
      title={onClick ? "Click to view the bot's tab" : undefined}
      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 whitespace-nowrap opacity-90 ${color} ${onClick ? "cursor-pointer hover:opacity-100" : ""}`}
    >
      <Spinner />
      {label}
    </button>
  );
}

function LivePulse({ color = "bg-green-400" }: { color?: string }) {
  return (
    <span className="relative flex size-2 shrink-0">
      <span className={`absolute inline-flex size-full rounded-full ${color} opacity-75 animate-ping`} />
      <span className={`relative inline-flex size-2 rounded-full ${color}`} />
    </span>
  );
}

/**
 * Live, step-by-step status — shows the agent's own one-sentence explanation
 * of what it's doing right now (e.g. "Filling email") instead of a static
 * "Filling form…" label. Falls back to `fallback` until the first action
 * lands (run.lastStepReason is empty for a brief moment at the very start).
 */
function LiveStepBadge({
  text,
  fallback,
  onClick,
}: {
  text?: string;
  fallback: string;
  /** Focuses the hidden automation tab so the user can watch it live. */
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={`${text || fallback} — click to view the bot's tab`}
      className="w-full py-2 px-3 rounded-xl text-white flex items-center justify-center gap-2 whitespace-nowrap opacity-90 hover:opacity-100 cursor-pointer bg-cyan-600"
    >
      <Spinner />
      <span className="text-2xs font-medium truncate">{text || fallback}</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function JobsTableApplyButton({
  job,
  session: s,
  extState,
  onApply,
  onResume,
  onViewQA,
  onEmailApply,
  onFocusExtTab,
  onAttention,
}: Props) {
  // ── No session yet — show the initial "Apply Now" CTA ────────────────────
  if (!s) {
    if (extState === "installed" && !job.emailApply) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onApply(); }}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
        >
          <LivePulse color="bg-green-400" />
          <span className="text-sm">🧩</span> Apply Now
        </button>
      );
    }
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onApply(); }}
        className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors whitespace-nowrap"
        title={extState === "not_installed" ? "Install CverAI extension for faster automation" : undefined}
      >
        {job.emailApply ? "Auto Apply ✦" : "Apply Now"}
      </button>
    );
  }

  // ── Active session — derive UI purely from session.status ─────────────────
  switch (s.status) {
    // ── Pre-flight ──────────────────────────────────────────────────────────
    case "routing":
      return <SpinnerButton label="Starting…" color="bg-indigo-500" />;

    // ── Extension path — clickable to bring the hidden tab into view ────────
    case "ext:queued":
      return <SpinnerButton label="Sending to bot…" color="bg-indigo-500" onClick={onFocusExtTab} />;

    case "ext:navigating":
      return <SpinnerButton label="Opening page…" color="bg-indigo-500" onClick={onFocusExtTab} />;

    case "ext:analyzing":
      return <SpinnerButton label="Analyzing form…" color="bg-violet-600" onClick={onFocusExtTab} />;

    case "ext:filling":
      return (
        <LiveStepBadge
          text={s.lastStepSummary}
          fallback="Filling form…"
          onClick={onFocusExtTab}
        />
      );

    case "ext:awaiting_answers":
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onAttention(); }}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          Questions need answers →
        </button>
      );

    case "ext:awaiting_submit":
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onAttention(); }}
          className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          Form filled — approve →
        </button>
      );

    case "ext:stuck":
      return (
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <button
            onClick={(e) => { e.stopPropagation(); onFocusExtTab(); }}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            Help bot finish →
          </button>
          {s.stuckReason && (
            <p className="text-3xs text-amber-600 bg-amber-50 rounded-xl px-2 py-1 leading-relaxed max-w-sm break-all">
              {s.stuckReason}
            </p>
          )}
        </div>
      );

    // ── Cloud-bot path ──────────────────────────────────────────────────────
    case "cloud:starting":
      return <SpinnerButton label="Starting bot…" color="bg-indigo-500" />;

    case "cloud:running":
    case "cloud:resuming":
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

    case "cloud:paused":
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
            onClick={(e) => { e.stopPropagation(); onResume(); }}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
          >
            Done — let the bot continue
          </button>
        </div>
      );

    // ── Terminal: success ───────────────────────────────────────────────────
    case "applied":
      return (
        <div className="flex flex-col gap-1.5 min-w-[130px]">
          <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-green-600 text-white text-center whitespace-nowrap">
            {s.strategy === "extension" ? "Applied via extension ✓" : "Application submitted ✓"}
          </div>
          {s.applicationQA && s.applicationQA.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewQA(); }}
              className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium text-green-700 bg-green-50 hover:bg-green-100 whitespace-nowrap"
            >
              View questions &amp; answers →
            </button>
          )}
        </div>
      );

    // ── Terminal: failure ───────────────────────────────────────────────────
    case "failed":
      return (
        <div className="flex flex-col gap-1.5 min-w-[130px]">
          <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-red-50 text-red-600 text-center border border-red-200 whitespace-nowrap">
            Application failed
          </div>
          {s.stuckReason && (
            <p className="text-2xs text-red-500 line-clamp-1 text-right">{s.stuckReason}</p>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onApply(); }}
            className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      );

    // ── Terminal: recruiter email found ─────────────────────────────────────
    case "recruiter_email":
      return (
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 text-center border border-blue-200 whitespace-nowrap">
            Recruiter email found
          </div>
          {s.recruiterEmail && (
            <p className="text-2xs text-blue-600 font-mono truncate text-right">{s.recruiterEmail}</p>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); s.recruiterEmail && onEmailApply(s.recruiterEmail, job.id); }}
            className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
          >
            Send Email Application ✦
          </button>
        </div>
      );

    // ── Terminal: user skipped / below threshold ────────────────────────────
    case "skipped":
      return (
        <div className="flex flex-col gap-1.5 min-w-[130px]">
          <div className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gray-50 text-gray-500 text-center border border-gray-200 whitespace-nowrap">
            Skipped
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onApply(); }}
            className="w-full py-1.5 px-3 rounded-xl text-2xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
          >
            Try anyway
          </button>
        </div>
      );
  }
}
