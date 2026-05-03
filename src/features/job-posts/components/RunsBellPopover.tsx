"use client";

import { useEffect, useRef, useState } from "react";
import { Briefcase, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ActiveRun, RunLogEntry } from "../types/apply-session.types";
import { useRouter } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prettyStatus(s: string): string {
  switch (s) {
    case "loading":
      return "Queued";
    case "running":
      return "Processing";
    case "awaiting_user_input":
      return "Attention";
    case "awaiting_submit_approval":
      return "Attention";
    case "submitted":
    case "complete":
      return "Applied";
    case "stopped":
      return "Stopped";
    case "blocked":
      return "Attention";
    case "error":
      return "Error";
    default:
      return "Queued";
  }
}

function statusLabel(s: string): string {
  switch (s) {
    case "loading":
      return "Queued";
    case "running":
      return "Processing...";
    case "awaiting_user_input":
    case "awaiting_submit_approval":
    case "blocked":
      return "Attention needed";
    case "submitted":
    case "complete":
      return "Applied";
    case "stopped":
      return "Stopped";
    case "error":
      return "Error";
    default:
      return "Queued";
  }
}

function statusPillClass(s: string): string {
  const key = prettyStatus(s);
  if (key === "Applied") return "bg-green-100 text-green-700";
  if (key === "Processing") return "bg-yellow-100 text-yellow-700";
  if (key === "Attention") return "bg-red-100 text-red-600";
  if (key === "Error") return "bg-red-100 text-red-600";
  return "bg-gray-200 text-gray-600";
}

function lastInterestingAction(run: ActiveRun): string | null {
  if (!run.log) return null;
  for (let i = run.log.length - 1; i >= 0; i--) {
    const e: RunLogEntry = run.log[i];
    if (e.level === "action" || e.level === "info") return e.text;
  }
  return null;
}

function CompanyAvatar({ company }: { company: string }) {
  const letter = company?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-yellow-400 font-bold shrink-0 text-sm">
      {letter}
    </div>
  );
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
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeBadgeCount = runs.filter((r) =>
    [
      "loading",
      "running",
      "awaiting_user_input",
      "awaiting_submit_approval",
    ].includes(r.status),
  ).length;

  const completedCount = runs.filter((r) =>
    ["submitted", "complete", "stopped", "error", "blocked"].includes(r.status),
  ).length;
  const pct =
    runs.length === 0 ? 0 : Math.round((completedCount / runs.length) * 100);

  const pendingApprovals = runs.filter(
    (r) => r.status === "awaiting_submit_approval",
  ).length;

  const visibleRuns = showAll ? runs : runs.slice(0, 6);

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

  // Reset showAll when closed
  useEffect(() => {
    if (!open) setShowAll(false);
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
        {activeBadgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {activeBadgeCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-11 w-120 z-50">
          <Card className="rounded-2xl shadow-xl border border-gray-100">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">
                  Active ({runs.length})
                </h2>
                <span className="text-sm text-gray-400">{pct}% completion</span>
              </div>

              {/* Run list */}
              {runs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  No runs yet. Apply to a job to get started.
                </p>
              ) : (
                <div>
                  {visibleRuns.map((run) => {
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
                    const isAutoApply =
                      run.openMode === "window" || run.openMode === "iframe";

                    const isTerminal = ["submitted", "complete", "applied"].includes(run.status);

                    return (
                      <div
                        key={run.id}
                        className="flex items-center justify-between py-3.5 border-b last:border-none cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors group"
                        onClick={() => {
                          setOpen(false);
                          if (isTerminal && run.applicationId) {
                            router.push(`/dashboard/jobs/${run.applicationId}/application-details`);
                          } else {
                            onOpenRun(run.id);
                          }
                        }}
                      >
                        {/* Left: avatar + title */}
                        <div className="flex items-center gap-3 min-w-0">
                          <CompanyAvatar company={company} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-800 truncate capitalize">
                                {title}
                                {company ? ` @${company}` : ""}
                              </span>
                              {isAutoApply && (
                                <div className="flex items-center gap-1 bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0">
                                  <span>⚡</span>
                                  Auto-apply
                                </div>
                              )}
                              {run?.jobUrl && (
                                <div className="flex items-center gap-1 bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0">
                                  <Briefcase className="size-4" />
                                  <a
                                    href={run.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="underline"
                                  >
                                    View job
                                  </a>
                                </div>
                              )}
                            </div>
                            {liveAction && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {liveAction}
                              </p>
                            )}
                            {run.blockedMessage && (
                              <p className="text-xs text-red-400 truncate mt-0.5">
                                {run.blockedMessage}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: status + dismiss */}
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <Badge
                            className={`rounded-full px-3.5 py-1 text-xs font-medium border-0 ${statusPillClass(run.status)}`}
                          >
                            {statusLabel(run.status)}
                          </Badge>
                          <button
                            className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDismissRun(run.id);
                            }}
                            title="Dismiss"
                            aria-label="Dismiss run"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer button */}
              {runs.length > 6 && (
                <Button
                  className="w-full mt-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 shadow-none font-medium text-sm"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? "Show less" : `See all ${runs.length} runs`}
                </Button>
              )}
              {pendingApprovals > 0 && (
                <Button
                  className="w-full mt-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border-0 shadow-none font-medium text-sm"
                  onClick={() => setOpen(false)}
                >
                  {pendingApprovals} pending approval
                  {pendingApprovals > 1 ? "s" : ""}
                </Button>
              )}
              <Button
                className="w-full mt-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 border-0 shadow-none font-medium text-sm"
                onClick={() => {
                  setOpen(false);
                  router.push("/dashboard/jobs/job-queue");
                }}
              >
                See all approvals
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
