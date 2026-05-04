"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { BookmarkIcon, Calendar, DollarSign, MapPin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PiOfficeChairFill } from "react-icons/pi";
import { formatAppliedDate, stripUrlProtocol } from "@/lib/utils/helpers";
import { useUpdateJobMutation } from "@/features/jobs/mutations/jobs.mutations";
import { useApplyJob } from "@/features/jobs/hooks/useApplyJob";
import { useToggleBookmarkByJobMutation } from "@/features/bookmarks/mutations/bookmarks.mutations";
import type { JobPost } from "@/features/job-posts";
import {
  useBotStatus,
  useResumeBrowserApplicationMutation,
  type BotSession,
} from "@/features/browser-automation";
import { BotStatusDrawer } from "@/features/jobs/components/BotStatusDrawer";
import MobileJobCard from "@/features/job-posts/components/MobileJobCard";

// ─── Invisible SSE poller ─────────────────────────────────────────────────────

function BotPoller({
  applicationId,
  jobId,
  onUpdate,
}: {
  applicationId: string;
  jobId: string;
  onUpdate: (jobId: string, patch: Partial<BotSession>) => void;
}) {
  useBotStatus(applicationId, jobId, onUpdate);
  return null;
}

// ─── Apply button — 5 states (desktop) ───────────────────────────────────────

export function ApplyButton({
  job,
  session,
  onApply,
  onResume,
  onViewQA,
  onEmailApply,
}: {
  job: JobPost;
  session: BotSession | undefined;
  onApply: (job: JobPost, e?: React.MouseEvent) => void;
  onResume: (applicationId: string) => void;
  onViewQA: (jobId: string) => void;
  onEmailApply: (recruiterEmail: string) => void;
}) {
  const s = session;

  // ── 1: No session ──
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

  // ── 2: Starting bot ──
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

  // ── 3: Running / resuming ──
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

  // ── 4: Stuck ──
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

  // ── 5a: Completed ──
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

  // ── 5b: Failed ──
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

  // ── 5c: Recruiter email found — no form on site ──
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

// ─── Desktop table row ────────────────────────────────────────────────────────

function JobRow({
  job,
  session,
  handleApply,
  handleResume,
  handleViewQA,
  handleEmailApply,
  handleBookmark,
  onRowClick,
}: {
  job: JobPost;
  session: BotSession | undefined;
  handleApply: (job: JobPost, e?: React.MouseEvent) => void;
  handleResume: (applicationId: string) => void;
  handleViewQA: (jobId: string) => void;
  handleEmailApply: (recruiterEmail: string) => void;
  handleBookmark: () => void;
  onRowClick: () => void;
}) {
  const isBookmarked = job?.isBookmarked ?? false;
  const link = job?.link || job?.applyUrl || job?.emailApply;

  return (
    <TableRow
      onClick={onRowClick}
      className="hover:bg-white border-b rounded-3xl! hover:border-primary hover:border-2 hover:rounded-2xl hover:cursor-pointer"
    >
      <TableCell className="w-16 shrink-0">
        <div className="flex items-center justify-center size-16">
          <img
            src={job?.companyLogo || "/placeholder.jpg"}
            alt={job?.companyText ?? ""}
            className="size-12 object-contain"
          />
        </div>
      </TableCell>

      <TableCell className="min-w-0">
        <div className="capitalize min-w-0">
          <div className="flex gap-3 items-center min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="inline-flex cursor-help" type="button">
                  <div className="capitalize font-medium text-xs truncate min-w-0 max-w-xs">
                    {job?.title}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="capitalize">{job?.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1 shrink-0">
              <span className="text-2xs whitespace-nowrap">
                {job?.jobType || job?.employmentType || job?.classification || job?.localizedTo}
              </span>
            </div>
            <div className="bg-blue-50 rounded text-blue-600 px-2 py-1 shrink-0">
              <span className="text-2xs whitespace-nowrap">
                {stripUrlProtocol(link ?? "")?.split("/")[0]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
            <p className="flex gap-1 text-gray-400 items-center min-w-0">
              <MapPin className="size-3 shrink-0" />
              <span className="text-2xs truncate">{job?.location}</span>
            </p>
            <p className="flex gap-1 text-gray-400 items-center min-w-0">
              <PiOfficeChairFill className="size-3 shrink-0" />
              <span className="text-2xs truncate">{job?.companyName}</span>
            </p>
            {job?.salary && (
              <p className="hidden lg:flex gap-1 text-gray-400 items-center">
                <DollarSign className="size-3 shrink-0" />
                <span className="text-2xs">{job?.salary}</span>
              </p>
            )}
            <p className="hidden lg:flex gap-1 text-gray-400 items-center">
              <Calendar className="size-3 shrink-0" />
              <span className="text-2xs whitespace-nowrap">
                {formatAppliedDate(job?.postedAt || job?.updatedAt)}
              </span>
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="w-12">
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleBookmark(); }}
          className="flex justify-end"
        >
          <Toggle
            pressed={isBookmarked}
            aria-label="Toggle bookmark"
            size="sm"
            variant="outline"
            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-black data-[state=on]:*:[svg]:stroke-black"
          >
            <BookmarkIcon />
          </Toggle>
        </div>
      </TableCell>

      <TableCell className="w-40">
        <div className="flex justify-end">
          <ApplyButton
            job={job}
            session={session}
            onApply={handleApply}
            onResume={handleResume}
            onViewQA={handleViewQA}
            onEmailApply={handleEmailApply}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

export default function JobsTable({
  allJobs,
  referrer,
}: {
  allJobs: JobPost[];
  referrer: string;
}) {
  const router = useRouter();
  const updateJobs = useUpdateJobMutation();
  const toggleBookmark = useToggleBookmarkByJobMutation();
  const { applyToJob } = useApplyJob();
  const { mutate: resumeApplication } = useResumeBrowserApplicationMutation();

  // jobId → flat BotSession (same shape as reference)
  const [botSessions, setBotSessions] = useState<Record<string, BotSession>>({});
  // jobId whose QA drawer is open
  const [qaJobId, setQaJobId] = useState<string | null>(null);
  // jobs hidden after manual / email apply

  // Stable patch — used by BotPoller onUpdate
  const patchSession = useCallback((jobId: string, patch: Partial<BotSession>) => {
    setBotSessions((prev) =>
      prev[jobId] ? { ...prev, [jobId]: { ...prev[jobId], ...patch } } : prev,
    );
  }, []);

  // ── Called BEFORE the API request → shows spinner immediately ──
  const handleBotStarting = useCallback((jobId: string) => {
    setBotSessions((prev) => ({
      ...prev,
      [jobId]: { applicationId: "", liveUrl: "", status: "starting" },
    }));
  }, []);

  // ── Called AFTER API returns → transitions to "running", poller mounts ──
  const handleBotStarted = useCallback(
    (jobId: string, applicationId: string, liveUrl: string) => {
      if (!applicationId) {
        // API failed — clear the starting state
        setBotSessions((prev) => {
          const next = { ...prev };
          delete next[jobId];
          return next;
        });
        return;
      }
      setBotSessions((prev) => ({
        ...prev,
        [jobId]: { applicationId, liveUrl, status: "running" },
      }));
    },
    [],
  );

  const handleApply = useCallback(
    (job: JobPost, e?: React.MouseEvent) =>
      {   window.open(
        job?.applyUrl ?? job.link ?? "",
        "_blank",
        "noopener,noreferrer",
      );
      return;},
    [applyToJob, handleBotStarting, handleBotStarted],
  );

  const handleResume = useCallback(
    (applicationId: string) => {
      resumeApplication(
        { jobApplicationId: applicationId },
        {
          onSuccess: () => {
            setBotSessions((prev) => {
              const entry = Object.entries(prev).find(
                ([, s]) => s.applicationId === applicationId,
              );
              if (!entry) return prev;
              return { ...prev, [entry[0]]: { ...entry[1], status: "resuming" } };
            });
          },
        },
      );
    },
    [resumeApplication],
  );

  const handleEmailApply = useCallback(
    (recruiterEmail: string) => {
      applyToJob({ id: "", emailApply: recruiterEmail });
    },
    [applyToJob],
  );

  // Only open SSE for sessions that have an applicationId and are not terminal
  const activePollers = Object.entries(botSessions).filter(
    ([, s]) =>
      s.applicationId &&
      s.status !== "completed" &&
      s.status !== "failed" &&
      s.status !== "recruiter_email_found" &&
      s.status !== "starting",
  );

  const qaSession = qaJobId ? botSessions[qaJobId] : null;
  const qaJob = qaJobId ? allJobs.find((j) => j.id === qaJobId) : null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Invisible SSE pollers — one per active (non-starting) bot session */}
      {activePollers.map(([jobId, s]) => (
        <BotPoller
          key={s.applicationId}
          applicationId={s.applicationId}
          jobId={jobId}
          onUpdate={patchSession}
        />
      ))}

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableBody>
            {allJobs.map((job) => (
              <JobRow
                key={job?.id}
                job={job}
                session={botSessions[job.id]}
                handleApply={handleApply}
                handleResume={handleResume}
                handleViewQA={setQaJobId}
                handleEmailApply={handleEmailApply}
                handleBookmark={() =>
                  toggleBookmark.mutate({
                    jobId: job?.id,
                    isBookmarked: job?.isBookmarked ?? false,
                  })
                }
                onRowClick={() =>
                  router.push(
                    `/dashboard/jobs/${job?.id}?referrer=${referrer ?? "jobs"}&title=${encodeURIComponent(job?.title ?? "")}`,
                  )
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards — same 5-state bot UI */}
      <div className="lg:hidden mt-4">
        <div className="space-y-4">
          {allJobs.map((job) => (
            <MobileJobCard
              key={job.id}
              job={job}
              session={botSessions[job.id]}
              onApply={handleApply}
              onResume={handleResume}
              onViewQA={setQaJobId}
              onEmailApply={handleEmailApply}
              onBookmark={() =>
                updateJobs.mutate({
                  id: String(job.id),
                  data: { isBookmarked: !job.isBookmarked },
                })
              }
              onRowClick={() =>
                router.push(
                  `/dashboard/jobs/${job?.id}?referrer=${referrer ?? "jobs"}&title=${encodeURIComponent(job?.title ?? "")}`,
                )
              }
            />
          ))}
        </div>
      </div>

      {/* QA Drawer — shows after "View questions & answers" is clicked */}
      {qaSession?.applicationQA && qaJob && (
        <BotStatusDrawer
          jobTitle={qaJob.title ?? "Job"}
          qa={qaSession.applicationQA}
          onClose={() => setQaJobId(null)}
        />
      )}
    </div>
  );
}
