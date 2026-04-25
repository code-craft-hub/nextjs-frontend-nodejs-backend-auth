"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Bot,
  Clock,
  ListChecks,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jobApplicationQueries } from "@/features/analytics/queries/application-history.queries";

// ─── Snapshot shape ───────────────────────────────────────────────────────────

interface QAPair {
  question: string;
  answer: string;
}

interface ApplicationSnapshotData {
  source: string;
  qaPairs?: QAPair[];
  confirmed?: boolean;
  durationMs?: number;
  stepsCompleted?: number;
  automationRunId?: string;
  confirmationText?: string;
  formFieldsTotal?: number;
  formFieldsFilled?: number;
  /** Legacy flat map — converted to qaPairs if qaPairs is absent */
  answersMap?: Record<string, string>;
}

interface ApplicationWithSnapshot {
  id: string;
  status: string;
  appliedAt?: string;
  snapshot?: ApplicationSnapshotData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    browser_automation: "Browser Automation",
    email: "Email",
    manual: "Manual",
  };
  return map[source] ?? source;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--button-accent)] border border-[color-mix(in_oklch,var(--cverai-blue)_15%,transparent)]">
      <span className="text-[var(--cverai-blue)]">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] text-[var(--cverai-brown)] font-medium uppercase tracking-wide leading-none mb-0.5">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
    </div>
  );
}

function QAPairRow({ pair, index }: { pair: QAPair; index: number }) {
  return (
    <div className="flex gap-3 py-3">
      <span className="mt-0.5 flex items-center justify-center size-5 shrink-0 rounded-full bg-[var(--button-accent)] text-[var(--cverai-blue)] text-[10px] font-bold">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--cverai-brown)] uppercase tracking-wide mb-1">
          {pair.question}
        </p>
        <p className="text-sm text-gray-800 leading-relaxed break-words">
          {pair.answer}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ApplicationSnapshot({ jobId }: { jobId: string }) {
  const [expanded, setExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    ...jobApplicationQueries.byJob(jobId),
    // Poll every 3 s while the bot is actively filling this form.
    // refetchInterval receives the query so we can read the current status
    // without a separate state variable (avoids stale-closure issues).
    refetchInterval: (query) => {
      const app = (query.state.data as { data?: ApplicationWithSnapshot[] } | undefined)?.data?.[0];
      return app?.status === "in_progress" ? 3000 : false;
    },
    // When polling is active, data must be considered fresh immediately so
    // React Query actually re-fetches instead of serving the cache.
    staleTime: 0,
  });

  if (isLoading) return null;

  const application = data?.data?.[0] as ApplicationWithSnapshot | undefined;
  const snapshot = application?.snapshot;
  const isInProgress = application?.status === "in_progress";

  if (!application || !snapshot) return null;

  // Fall back to answersMap for older records that pre-date qaPairs
  const SENTINEL = new Set(["UPLOAD_RESUME", "SKIP_FILE_UPLOAD"]);
  const qaPairs =
    snapshot.qaPairs ??
    (snapshot.answersMap
      ? Object.entries(snapshot.answersMap)
          .filter(([, v]) => v && !SENTINEL.has(v))
          .map(([question, answer]) => ({ question, answer }))
      : []);

  const visiblePairs = expanded ? qaPairs : qaPairs.slice(0, 3);

  return (
    <div className="mt-8">
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <span className="text-xs font-semibold text-[var(--cverai-brown)] uppercase tracking-widest px-2">
          Application Details
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <Card className="overflow-hidden border-0 shadow-md bg-white rounded-2xl">
        {/* Header band */}
        <CardHeader className={`px-6 py-5 border-b border-gray-100 bg-gradient-to-r ${isInProgress ? "from-[color-mix(in_oklch,var(--cverai-blue)_10%,white)] to-[color-mix(in_oklch,var(--cverai-blue)_5%,white)]" : "from-[color-mix(in_oklch,var(--cverai-green)_12%,white)] to-[color-mix(in_oklch,var(--cverai-blue)_8%,white)]"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center size-10 rounded-full border ${isInProgress ? "bg-[color-mix(in_oklch,var(--cverai-blue)_15%,white)] border-[color-mix(in_oklch,var(--cverai-blue)_25%,transparent)]" : "bg-[color-mix(in_oklch,var(--cverai-green)_20%,white)] border-[color-mix(in_oklch,var(--cverai-green)_30%,transparent)]"}`}>
                {isInProgress
                  ? <Loader2 className="size-5 text-[var(--cverai-blue)] animate-spin" />
                  : <CheckCircle2 className="size-5 text-[var(--cverai-green)]" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-tight">
                  {isInProgress ? "Application In Progress" : "Application Submitted"}
                </h3>
                <p className="text-xs text-[var(--cverai-brown)] mt-0.5">
                  {isInProgress
                    ? "Bot is actively filling this form — updating live…"
                    : "We applied to this job on your behalf"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isInProgress && (
                <Badge className="bg-[color-mix(in_oklch,var(--cverai-blue)_12%,white)] text-[var(--cverai-blue)] border border-[color-mix(in_oklch,var(--cverai-blue)_25%,transparent)] text-xs font-medium px-2.5 gap-1.5">
                  <span className="relative flex size-2">
                    <span className="animate-ping absolute inline-flex size-full rounded-full bg-[var(--cverai-blue)] opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-[var(--cverai-blue)]" />
                  </span>
                  Live
                </Badge>
              )}
              {snapshot.confirmed && (
                <Badge className="bg-[color-mix(in_oklch,var(--cverai-green)_15%,white)] text-[var(--cverai-green)] border border-[color-mix(in_oklch,var(--cverai-green)_30%,transparent)] hover:bg-[color-mix(in_oklch,var(--cverai-green)_20%,white)] text-xs font-medium px-2.5">
                  Confirmed
                </Badge>
              )}
              <Badge className="bg-[var(--button-accent)] text-[var(--cverai-blue)] border border-[color-mix(in_oklch,var(--cverai-blue)_20%,transparent)] hover:bg-[var(--button-accent)] text-xs font-medium px-2.5">
                <Bot className="size-3 mr-1" />
                {sourceLabel(snapshot.source)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-5 space-y-6">
          {/* Stats row */}
          {(snapshot.durationMs !== undefined ||
            snapshot.stepsCompleted !== undefined ||
            snapshot.formFieldsFilled !== undefined) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {snapshot.formFieldsFilled !== undefined && (
                <StatPill
                  icon={<ClipboardList className="size-4" />}
                  label="Fields filled"
                  value={
                    snapshot.formFieldsTotal
                      ? `${snapshot.formFieldsFilled} / ${snapshot.formFieldsTotal}`
                      : `${snapshot.formFieldsFilled}`
                  }
                />
              )}
              {snapshot.durationMs !== undefined && (
                <StatPill
                  icon={<Clock className="size-4" />}
                  label="Time taken"
                  value={formatDuration(snapshot.durationMs)}
                />
              )}
              {snapshot.stepsCompleted !== undefined && (
                <StatPill
                  icon={<ListChecks className="size-4" />}
                  label="Steps done"
                  value={`${snapshot.stepsCompleted} steps`}
                />
              )}
              <StatPill
                icon={<Bot className="size-4" />}
                label="Applied via"
                value={sourceLabel(snapshot.source)}
              />
            </div>
          )}

          {/* Q&A pairs */}
          {qaPairs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--cverai-brown)] uppercase tracking-wide mb-3">
                Form Responses
              </p>
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 divide-y divide-gray-100 px-4">
                {visiblePairs.map((pair, i) => (
                  <QAPairRow key={i} pair={pair} index={i} />
                ))}
              </div>

              {qaPairs.length > 3 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--cverai-blue)] hover:text-[var(--cverai-blue)]/80 transition-colors mx-auto"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="size-3.5" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-3.5" />
                      Show {qaPairs.length - 3} more
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Confirmation text */}
          {snapshot.confirmationText && (
            <>
              <Separator className="bg-gray-100" />
              <div>
                <p className="text-xs font-semibold text-[var(--cverai-brown)] uppercase tracking-wide mb-3">
                  Confirmation
                </p>
                <Alert className="bg-[color-mix(in_oklch,var(--cverai-green)_8%,white)] border-[color-mix(in_oklch,var(--cverai-green)_25%,transparent)] rounded-xl">
                  <CheckCircle2 className="size-4 text-[var(--cverai-green)]" />
                  <AlertDescription className="text-sm text-gray-700 leading-relaxed ml-1">
                    {snapshot.confirmationText.split("\n\nAttachments:")[0]}
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}

          {/* Footer: run ID */}
          {snapshot.automationRunId && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-400 font-mono">
                Run ID: {snapshot.automationRunId}
              </span>
              {application.appliedAt && (
                <span className="text-[10px] text-gray-400">
                  {new Date(application.appliedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
