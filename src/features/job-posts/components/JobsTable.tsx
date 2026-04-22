"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody } from "@/components/ui/table";
import { useUpdateJobMutation } from "@/features/jobs/mutations/jobs.mutations";
import { useApplyJob } from "@/features/jobs/hooks/useApplyJob";
import { useToggleBookmarkByJobMutation } from "@/features/bookmarks/mutations/bookmarks.mutations";
import type { JobPost } from "@/features/job-posts";
import {
  useResumeBrowserApplicationMutation,
  type BotSession,
} from "@/features/browser-automation";
import { BotStatusDrawer } from "@/features/jobs/components/BotStatusDrawer";
import MobileJobCard from "@/features/job-posts/components/MobileJobCard";
import { useExtension } from "@/features/job-posts/hooks/useExtension";
// import { ExtensionInstallBanner } from "@/features/job-posts/components/ExtensionInstallBanner";
import { JobsTableBotPoller } from "@/features/job-posts/components/JobsTableBotPoller";
import { JobsTableRow } from "@/features/job-posts/components/JobsTableRow";

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

  // Extension detection — drives desktop vs mobile apply path
  const { state: extState, applyViaExtension } = useExtension();

  // jobId → BotSession (backend automation sessions)
  const [botSessions, setBotSessions] = useState<Record<string, BotSession>>({});
  // jobIds dispatched to the extension (no backend session, sidepanel owns status)
  const [extDispatchedJobs, setExtDispatchedJobs] = useState<Set<string>>(new Set());
  // jobId whose QA drawer is open
  const [qaJobId, setQaJobId] = useState<string | null>(null);

  // ── Backend session helpers ──────────────────────────────────────────────

  const patchSession = useCallback((jobId: string, patch: Partial<BotSession>) => {
    setBotSessions((prev) =>
      prev[jobId] ? { ...prev, [jobId]: { ...prev[jobId], ...patch } } : prev,
    );
  }, []);

  const handleBotStarting = useCallback((jobId: string) => {
    setBotSessions((prev) => ({
      ...prev,
      [jobId]: { applicationId: "", liveUrl: "", status: "starting" },
    }));
  }, []);

  const handleBotStarted = useCallback(
    (jobId: string, applicationId: string, liveUrl: string) => {
      if (!applicationId) {
        // API failed — clear optimistic spinner
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

  // ── Apply handlers ───────────────────────────────────────────────────────

  /** Desktop + extension installed path */
  const handleExtApply = useCallback(
    (job: JobPost) => {
      applyViaExtension(job);
      setExtDispatchedJobs((prev) => new Set(prev).add(job.id));
    },
    [applyViaExtension],
  );

  /** Mobile / no-extension / email path — existing backend automation */
  const handleApply = useCallback(
    (job: JobPost, e?: React.MouseEvent) =>
      applyToJob(job, e, handleBotStarting, handleBotStarted),
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

  /** Email-based apply — untouched from original implementation */
  const handleEmailApply = useCallback(
    (recruiterEmail: string) => {
      applyToJob({ id: "", emailApply: recruiterEmail });
    },
    [applyToJob],
  );

  // ── SSE pollers — one per active (non-terminal) backend session ──────────

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
    <div className="w-full flex flex-col gap-4">
      {/* Invisible SSE pollers */}
      {activePollers.map(([jobId, s]) => (
        <JobsTableBotPoller
          key={s.applicationId}
          applicationId={s.applicationId}
          jobId={jobId}
          onUpdate={patchSession}
        />
      ))}

      {/* Extension install prompt — Chromium desktop only, dismissible */}
      {/* {extState === "not_installed" && <ExtensionInstallBanner />} */}

      {/* ── Desktop table (lg+) ──────────────────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableBody>
            {allJobs.map((job) => (
              <JobsTableRow
                key={job?.id}
                job={job}
                session={botSessions[job.id]}
                extState={extState}
                extDispatched={extDispatchedJobs.has(job.id)}
                onApply={handleApply}
                onResume={handleResume}
                onViewQA={setQaJobId}
                onEmailApply={handleEmailApply}
                onExtApply={handleExtApply}
                onBookmark={() =>
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

      {/* ── Mobile cards (< lg) — always uses backend automation ────────── */}
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

      {/* QA drawer — shows after "View questions & answers" is clicked */}
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
