"use client";

import { useEffect, useState } from "react";
import { Briefcase, X, Send, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type {
  ActiveRun,
  RunLogEntry,
  RunBatchQuestion,
} from "../types/apply-session.types";
import { useRouter } from "next/navigation";
import BellIcon from "@/components/icons/BellIcon";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prettyStatus(s: string): string {
  switch (s) {
    case "queued":
      return "In queue";
    case "loading":
      return "Starting";
    case "running":
      return "Processing";
    case "awaiting_user_input":
    case "awaiting_submit_approval":
    case "blocked":
      return "Attention";
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

function statusLabel(s: string): string {
  switch (s) {
    case "queued":
      return "In queue";
    case "loading":
      return "Starting…";
    case "running":
      return "Processing...";
    case "awaiting_user_input":
      return "Needs answers";
    case "awaiting_submit_approval":
      return "Ready to submit";
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

// ─── postMessage helpers (page → content-trigger.js → background) ─────────────

function sendAnswerBatch(runId: string, answers: Record<string, string>) {
  window.postMessage(
    { source: "cverai", type: "answer_batch", runId, answers },
    "*",
  );
}

function sendApproveSubmit(runId: string) {
  window.postMessage({ source: "cverai", type: "approve_submit", runId }, "*");
}

function sendStopRun(runId: string) {
  window.postMessage({ source: "cverai", type: "stop_run", runId }, "*");
}

// ─── Batch-question panel (inline inside popover row) ─────────────────────────

function BatchQuestionsPanel({
  run,
  onClose,
}: {
  run: ActiveRun;
  onClose: () => void;
}) {
  const questions: RunBatchQuestion[] = run.pendingBatch?.questions ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, ""])),
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Listen for ack from content-trigger so we can confirm delivery
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const d = e.data as Record<string, unknown> | null;
      if (!d || d.source !== "cverai-extension") return;
      if (d.type === "answer_batch_ack" && d.runId === run.id) {
        setSending(false);
        setSent(true);
        setTimeout(onClose, 1200);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [run.id, onClose]);

  function handleSend() {
    setSending(true);
    sendAnswerBatch(run.id, answers);
    // Fallback: if no ack within 3 s, close anyway
    setTimeout(() => {
      setSending(false);
      onClose();
    }, 3000);
  }

  const allFilled = questions.every((q) => answers[q.id]?.trim());

  if (sent) {
    return (
      <div className="flex items-center gap-2 py-3 text-green-600 text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        Answers sent — agent resuming…
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-3" onClick={(e) => e.stopPropagation()}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        The bot needs your answers to continue
      </p>
      {questions.map((q) => (
        <div key={q.id} className="space-y-1">
          <label className="text-xs font-medium text-gray-700 block">
            {q.field_label ?? q.question}
          </label>
          {q.why && <p className="text-xs text-gray-400 italic">{q.why}</p>}
          <Textarea
            className="text-sm min-h-[60px] resize-none rounded-lg"
            placeholder="Your answer…"
            value={answers[q.id] ?? ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
            }
          />
        </div>
      ))}
      <Button
        size="sm"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg gap-2"
        disabled={!allFilled || sending}
        onClick={handleSend}
      >
        <Send className="w-3.5 h-3.5" />
        {sending ? "Sending…" : "Send answers"}
      </Button>
    </div>
  );
}

// ─── Submit-approval panel ────────────────────────────────────────────────────

function SubmitApprovalPanel({
  run,
  onClose,
}: {
  run: ActiveRun;
  onClose: () => void;
}) {
  const summary: Array<{ field: string; value: string }> | string | undefined =
    run.pendingSubmit?.summary;
  const [approving, setApproving] = useState(false);

  function handleApprove() {
    setApproving(true);
    sendApproveSubmit(run.id);
    setTimeout(onClose, 800);
  }

  function handleStop() {
    sendStopRun(run.id);
    onClose();
  }

  // summary may be an array of { field, value } objects, a JSON string, or a plain string
  let summaryItems: Array<{ field: string; value: string }> | null = null;
  if (Array.isArray(summary)) {
    summaryItems = summary as Array<{ field: string; value: string }>;
  } else if (typeof summary === "string") {
    try {
      const parsed = JSON.parse(summary);
      if (Array.isArray(parsed)) summaryItems = parsed;
    } catch {
      // plain string — render as-is below
    }
  }

  return (
    <div className="mt-2 space-y-3" onClick={(e) => e.stopPropagation()}>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        Form filled — approve to submit
      </p>
      {summaryItems ? (
        <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-gray-100 p-2 bg-gray-50">
          {summaryItems.slice(0, 12).map((item, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="text-gray-500 min-w-0 truncate shrink-0 max-w-[45%]">
                {item.field}
              </span>
              <span className="text-gray-800 truncate">{item.value}</span>
            </div>
          ))}
          {summaryItems.length > 12 && (
            <p className="text-xs text-gray-400 text-center pt-1">
              +{summaryItems.length - 12} more fields
            </p>
          )}
        </div>
      ) : typeof summary === "string" && summary ? (
        <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 max-h-28 overflow-y-auto whitespace-pre-line">
          {summary}
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
          onClick={handleStop}
        >
          Stop
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg gap-1.5"
          disabled={approving}
          onClick={handleApprove}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {approving ? "Submitting…" : "Approve & Submit"}
        </Button>
      </div>
    </div>
  );
}

// ─── Log panel (inline inside popover row) ───────────────────────────────────

function RunLogPanel({ run }: { run: ActiveRun }) {
  const entries = run.log ?? [];
  const reversed = [...entries].reverse(); // newest first

  function levelColor(level: string) {
    if (level === "error") return "text-red-500";
    if (level === "warn") return "text-amber-500";
    if (level === "action") return "text-indigo-500";
    return "text-gray-500";
  }

  return (
    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
        Run log
      </p>
      {reversed.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No log entries.</p>
      ) : (
        <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-2 space-y-0.5">
          {reversed.map((entry, i) => (
            <div key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="text-gray-300 shrink-0 tabular-nums">
                {new Date(entry.t).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span
                className={`break-words min-w-0 ${levelColor(entry.level)}`}
              >
                {entry.text}
              </span>
            </div>
          ))}
        </div>
      )}
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
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const router = useRouter();

  const activeBadgeCount = runs?.filter((r) =>
    [
      "queued",
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

  const needsAttentionRuns = runs.filter(
    (r) =>
      r.status === "awaiting_user_input" ||
      r.status === "awaiting_submit_approval",
  );

  const visibleRuns = showAll ? runs : runs.slice(0, 6);

  // Auto-expand the first run that needs attention when the dialog opens
  useEffect(() => {
    if (!open) return;
    if (needsAttentionRuns.length > 0 && !expandedRunId) {
      setExpandedRunId(needsAttentionRuns[0].id);
    }
  }, [open, needsAttentionRuns, expandedRunId]);

  // Auto-open dialog when a run transitions to needing attention
  useEffect(() => {
    if (needsAttentionRuns.length > 0) {
      setOpen(true);
      setExpandedRunId((prev) => prev ?? needsAttentionRuns[0].id);
    }
  }, [needsAttentionRuns.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset state when closed
  useEffect(() => {
    if (!open) {
      setShowAll(false);
      setExpandedRunId(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Bell button */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm size-10"
          title={`${runs.length} auto-apply runs`}
          aria-label="Auto-apply runs"
        >
          <BellIcon className="size-5" />
          {activeBadgeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {activeBadgeCount}
            </span>
          )}
          {needsAttentionRuns.length > 0 && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="w-full sm:max-w-[480px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Active ({runs.length})
            </DialogTitle>
            <span className="text-sm text-gray-400">{pct}% completion</span>
          </div>
        </DialogHeader>

        {/* Scrollable run list */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
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
                const isPopupMode = run.openMode === "window";
                const isTerminal = [
                  "submitted",
                  "complete",
                  "applied",
                ].includes(run.status);
                const isDead = [
                  "error",
                  "blocked",
                  "stopped",
                  "max_turns",
                ].includes(run.status);
                const needsAttention =
                  run.status === "awaiting_user_input" ||
                  run.status === "awaiting_submit_approval";
                const isExpanded = expandedRunId === run.id;
                const expandsLogs = isPopupMode && isDead;

                return (
                  <div
                    key={run.id}
                    className={`py-3.5 border-b last:border-none -mx-2 px-2 rounded-xl transition-colors ${
                      needsAttention
                        ? "bg-amber-50/60"
                        : "hover:bg-gray-50 cursor-pointer"
                    } group`}
                    onClick={() => {
                      if (needsAttention || expandsLogs) {
                        setExpandedRunId((prev) =>
                          prev === run.id ? null : run.id,
                        );
                        return;
                      }
                      setOpen(false);
                      if (isTerminal && run.applicationId) {
                        router.push(
                          `/dashboard/jobs/${run.applicationId}/application-details`,
                        );
                      } else {
                        onOpenRun(run.id);
                      }
                    }}
                  >
                    {/* Row: avatar + title + status + dismiss */}
                    <div className="flex items-center justify-between">
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
                          {needsAttention && !isExpanded && (
                            <p className="text-xs text-amber-600 font-medium mt-0.5">
                              {run.status === "awaiting_user_input"
                                ? `${run.pendingBatch?.questions?.length ?? 0} question(s) need your answer — tap to expand`
                                : "Form filled and ready — tap to review & approve"}
                            </p>
                          )}
                          {expandsLogs && !isExpanded && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Tap to see full log
                            </p>
                          )}
                        </div>
                      </div>

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

                    {/* Inline interaction panel */}
                    {isExpanded &&
                      run.status === "awaiting_user_input" &&
                      run.pendingBatch && (
                        <BatchQuestionsPanel
                          run={run}
                          onClose={() => setExpandedRunId(null)}
                        />
                      )}
                    {isExpanded &&
                      run.status === "awaiting_submit_approval" &&
                      run.pendingSubmit && (
                        <SubmitApprovalPanel
                          run={run}
                          onClose={() => setExpandedRunId(null)}
                        />
                      )}
                    {isExpanded && expandsLogs && <RunLogPanel run={run} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-100 shrink-0 flex flex-col gap-2">
          {runs.length > 6 && (
            <Button
              className="w-full rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 shadow-none font-medium text-sm"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show less" : `See all ${runs.length} runs`}
            </Button>
          )}
          <Button
            className="w-full rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 border-0 shadow-none font-medium text-sm"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/jobs/job-queue");
            }}
          >
            See all approvals
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
