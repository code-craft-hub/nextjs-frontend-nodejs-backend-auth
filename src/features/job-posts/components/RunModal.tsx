"use client";

import { useEffect, useRef, useState } from "react";
import type { ActiveRun, RunBatchQuestion, RunLogEntry } from "../types/apply-session.types";

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
      return "Done ✓";
    case "stopped":
      return "Stopped";
    case "blocked":
      return "Blocked";
    case "error":
      return "Error";
    default:
      return s ?? "Running";
  }
}

function statusPillClass(s: string): string {
  if (s === "submitted" || s === "complete")
    return "bg-green-100 text-green-700 border-green-200";
  if (s === "running" || s === "loading")
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (s === "awaiting_user_input" || s === "awaiting_submit_approval")
    return "bg-amber-100 text-amber-700 border-amber-200";
  if (s === "blocked" || s === "error")
    return "bg-red-100 text-red-600 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-100";
}

function logLevelClass(level: RunLogEntry["level"]): string {
  switch (level) {
    case "error":
      return "text-red-500";
    case "warn":
      return "text-amber-500";
    case "action":
      return "text-indigo-500";
    case "thought":
      return "text-violet-500 italic";
    default:
      return "text-gray-500";
  }
}

// ─── Pending-batch question panel ─────────────────────────────────────────────

function BatchPanel({
  runId,
  questions,
}: {
  runId: string;
  questions: RunBatchQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, ""])),
  );
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Reset answers when the question set changes (different batch).
  const sigRef = useRef(questions.map((q) => q.id).join("|"));
  useEffect(() => {
    const sig = questions.map((q) => q.id).join("|");
    if (sig !== sigRef.current) {
      sigRef.current = sig;
      setAnswers(Object.fromEntries(questions.map((q) => [q.id, ""])));
      setSending(false);
      setSendError(null);
    }
  }, [questions]);

  // Listen for ack from content-trigger that the message reached background.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const d = e.data as Record<string, unknown> | null;
      if (!d || d.source !== "cverai-extension") return;
      if (d.type === "answer_batch_ack" && d.runId === runId) {
        if (!d.ok) {
          setSending(false);
          setSendError(
            "Could not reach extension background. Try clicking again.",
          );
        }
        // If ok=true the run status will flip to "running" via run_update —
        // the BatchPanel will unmount naturally.
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [runId]);

  function sendAnswers() {
    setSending(true);
    setSendError(null);
    window.postMessage(
      { source: "cverai", type: "answer_batch", runId, answers },
      "*",
    );
  }

  const allFilled = questions.every((q) => (answers[q.id] ?? "").trim() !== "");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 shadow-2xl"
      style={{ zIndex: 270, maxHeight: "50vh", overflowY: "auto" }}
    >
      <div className="px-6 py-4 max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-amber-700 mb-3">
          Agent needs your input — answer all to continue
        </p>
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id}>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                {q.question}
              </label>
              {q.why && (
                <p className="text-xs text-gray-400 mb-1">{q.why}</p>
              )}
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder={q.field_label ?? "Your answer…"}
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && allFilled && !sending) sendAnswers();
                }}
                disabled={sending}
              />
            </div>
          ))}
        </div>
        {sendError && (
          <p className="mt-2 text-xs text-red-600">{sendError}</p>
        )}
        <button
          onClick={sendAnswers}
          disabled={!allFilled || sending}
          className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? "Sending…" : "Send all answers"}
        </button>
      </div>
    </div>
  );
}

// ─── Submit-approval panel ────────────────────────────────────────────────────

function SubmitPanel({
  runId,
  summary,
}: {
  runId: string;
  summary: string;
}) {
  function approve() {
    window.postMessage(
      { source: "cverai", type: "approve_submit", runId },
      "*",
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-green-200 shadow-2xl"
      style={{ zIndex: 270 }}
    >
      <div className="px-6 py-4 max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-green-700 mb-2">
          Ready to submit — review and confirm
        </p>
        {summary && (
          <p className="text-xs text-gray-600 mb-4 whitespace-pre-wrap leading-relaxed">
            {summary}
          </p>
        )}
        <button
          onClick={approve}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Confirm &amp; Submit
        </button>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RunModalProps {
  run: ActiveRun | null;
  onClose: () => void;
  onStop: (runId: string) => void;
  /** Called when the log panel is shown/hidden so the parent can
   *  reposition the iframe to avoid overlap. */
  onLogsToggle: (showLogs: boolean) => void;
}

export function RunModal({ run, onClose, onStop, onLogsToggle }: RunModalProps) {
  const [showLogs, setShowLogs] = useState(false);

  // Add body class while modal is open so underlying content doesn't
  // bleed through gaps in the iframe coverage (mirrors test-site pattern).
  useEffect(() => {
    if (!run) return;
    document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [run?.id]);

  // Close on Escape
  useEffect(() => {
    if (!run) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [run, onClose]);

  // Notify parent when log panel visibility changes so it can
  // reposition the iframe (iframe lives outside React tree).
  const handleToggleLogs = () => {
    const next = !showLogs;
    setShowLogs(next);
    onLogsToggle(next);
  };

  // Reset log panel when a new run is opened
  useEffect(() => {
    setShowLogs(false);
    onLogsToggle(false);
    // We only want to reset on run id change, not on every update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.id]);

  if (!run) return null;

  const jobTitle = run.job?.title ?? "Job";
  const company = run.job?.company ?? "";
  const entries = run.log ?? [];
  const isTerminal = ["submitted", "complete", "stopped", "error", "blocked"].includes(
    run.status,
  );

  const pendingQuestions = run.pendingBatch?.questions ?? [];
  const pendingSubmit = run.pendingSubmit ?? null;

  return (
    <>
      {/* Backdrop — intentionally does NOT close on click so the user can
          interact with the page behind the iframe without losing context. */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        style={{ zIndex: 150 }}
        aria-hidden
      />

      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center gap-2 px-4 bg-white/95 backdrop-blur border-b border-gray-200"
        style={{
          height: 72,
          zIndex: 260,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors shrink-0 text-sm"
          title="Close (Esc)"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {jobTitle}
            {company ? ` — ${company}` : ""}
          </p>
        </div>

        {/* Status pill */}
        <span
          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg border ${statusPillClass(run.status)}`}
        >
          {prettyStatus(run.status)}
        </span>

        {/* Logs toggle */}
        <button
          onClick={handleToggleLogs}
          className="shrink-0 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {showLogs ? "Hide logs" : "Show logs"}
        </button>

        {/* Stop */}
        {!isTerminal && (
          <button
            onClick={() => onStop(run.id)}
            className="shrink-0 text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
          >
            Stop
          </button>
        )}
      </div>

      {/* Log panel — right side, below the bar */}
      {showLogs && (
        <div
          className="fixed top-[72px] right-0 bottom-0 flex flex-col bg-white border-l border-gray-200"
          style={{
            width: "min(420px, 40vw)",
            zIndex: 260,
            boxShadow: "-4px 0 24px rgba(0,0,0,0.07)",
          }}
        >
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-gray-700">
              Activity log
            </span>
            <span className="text-xs text-gray-400">{entries.length} entries</span>
          </div>

          {/* Blocked banner */}
          {run.blockedMessage &&
            (run.status === "blocked" ||
              run.status === "error" ||
              run.status === "max_turns") && (
              <div className="mx-3 mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 shrink-0">
                ⚠ {run.blockedMessage}
              </div>
            )}

          {/* Log entries */}
          <ul className="flex-1 overflow-y-auto p-3 space-y-1">
            {entries.length === 0 ? (
              <li className="text-xs text-gray-400 py-4 text-center">
                No log entries yet…
              </li>
            ) : (
              entries.map((entry, i) => (
                <li
                  key={i}
                  className={`text-xs leading-relaxed font-mono ${logLevelClass(entry.level)}`}
                >
                  <span className="text-gray-300 mr-1.5">
                    {new Date(entry.t).toLocaleTimeString()}
                  </span>
                  {entry.text}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Agent question panel — shown when bot needs user input */}
      {pendingQuestions.length > 0 && (
        <BatchPanel runId={run.id} questions={pendingQuestions} />
      )}

      {/* Submit approval panel — shown when bot is ready to submit */}
      {pendingSubmit && pendingQuestions.length === 0 && (
        <SubmitPanel runId={run.id} summary={pendingSubmit.summary as any} />
      )}
    </>
  );
}
