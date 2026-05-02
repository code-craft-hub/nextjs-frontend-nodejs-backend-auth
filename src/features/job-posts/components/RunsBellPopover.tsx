"use client";

import { useEffect, useRef, useState } from "react";
import type { ActiveRun, RunLogEntry } from "../types/apply-session.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prettyStatus(s: string): string {
  switch (s) {
    case "loading":
      return "Loading…";
    case "running":
      return "Processing…";
    case "awaiting_user_input":
      return "Attention needed";
    case "awaiting_submit_approval":
      return "Ready to submit";
    case "submitted":
    case "complete":
      return "Done";
    case "stopped":
      return "Stopped";
    case "blocked":
      return "Blocked";
    case "error":
      return "Error";
    default:
      return s ?? "Queued";
  }
}

function statusPillClass(s: string): string {
  if (s === "submitted" || s === "complete")
    return "bg-green-100 text-green-700";
  if (s === "running" || s === "loading") return "bg-blue-100 text-blue-700";
  if (
    s === "awaiting_user_input" ||
    s === "awaiting_submit_approval" ||
    s === "blocked"
  )
    return "bg-amber-100 text-amber-700";
  if (s === "error") return "bg-red-100 text-red-600";
  return "bg-gray-100 text-gray-600";
}

function lastInterestingAction(run: ActiveRun): string | null {
  if (!run.log) return null;
  for (let i = run.log.length - 1; i >= 0; i--) {
    const e: RunLogEntry = run.log[i];
    if (e.level === "action" || e.level === "info") return e.text;
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RunsBellPopoverProps {
  runs: ActiveRun[];
  onOpenRun: (runId: string) => void;
  onDismissRun: (runId: string) => void;
}

export function RunsBellPopover({
  runs,
  onOpenRun,
  onDismissRun,
}: RunsBellPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeBadgeCount = runs.filter((r) =>
    ["loading", "running", "awaiting_user_input", "awaiting_submit_approval"].includes(
      r.status,
    ),
  ).length;

  const completedCount = runs.filter((r) =>
    ["submitted", "complete", "stopped", "error", "blocked"].includes(r.status),
  ).length;
  const pct =
    runs.length === 0 ? 0 : Math.round((completedCount / runs.length) * 100);

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
        title={`${runs.length} auto-apply runs`}
        aria-label="Auto-apply runs"
      >
        {/* Bell icon */}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Active badge */}
        {activeBadgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {activeBadgeCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Auto-apply runs
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {runs.length} total · {pct}% complete
              </p>
            </div>
          </div>

          {/* Run list */}
          <div className="max-h-80 overflow-y-auto">
            {runs.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 px-4">
                Nothing yet. Switch to Deck view and apply to a job to start.
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {runs.map((run) => {
                  const title = run.job?.title ?? "Job";
                  const company = run.job?.company ?? "";
                  const isActive = [
                    "loading",
                    "running",
                    "awaiting_user_input",
                  ].includes(run.status);
                  const liveAction =
                    isActive && !run.blockedMessage
                      ? lastInterestingAction(run)
                      : null;

                  return (
                    <li
                      key={run.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer group transition-colors"
                      onClick={() => {
                        onOpenRun(run.id);
                        setOpen(false);
                      }}
                    >
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {title}
                          </span>
                          {company && (
                            <span className="text-xs text-gray-400 truncate">
                              @{company}
                            </span>
                          )}
                        </div>
                        {liveAction && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {liveAction}
                          </p>
                        )}
                        {run.blockedMessage && (
                          <p className="text-xs text-red-500 truncate mt-0.5">
                            {run.blockedMessage}
                          </p>
                        )}
                      </div>

                      {/* Status pill */}
                      <span
                        className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-lg ${statusPillClass(run.status)}`}
                      >
                        {prettyStatus(run.status)}
                      </span>

                      {/* Dismiss */}
                      <button
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-500 text-xs transition-opacity p-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissRun(run.id);
                        }}
                        title="Dismiss"
                        aria-label="Dismiss run"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
