"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody } from "@/components/ui/table";
import { useToggleBookmarkByJobMutation } from "@/features/bookmarks/mutations/bookmarks.mutations";
import { useUpdateJobMutation } from "@/features/jobs/mutations/jobs.mutations";
import type { JobPost } from "@/features/job-posts";
import { BotStatusDrawer } from "@/features/jobs/components/BotStatusDrawer";
import MobileJobCard from "@/features/job-posts/components/MobileJobCard";
import { JobsTableRow } from "@/features/job-posts/components/JobsTableRow";
import type { UseApplyOrchestrator } from "@/features/job-posts/hooks/useApplyOrchestrator";

export default function JobsTable({
  allJobs,
  referrer,
  orchestrator,
}: {
  allJobs: JobPost[];
  referrer: string;
  orchestrator: UseApplyOrchestrator;
}) {
  const router = useRouter();
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

  const qaSession = qaJobId ? sessions[qaJobId] : null;
  const qaJob = qaJobId ? allJobs.find((j) => j.id === qaJobId) : null;

  const jobUrl = (job: JobPost) =>
    `/dashboard/jobs/${job?.id}?referrer=${referrer ?? "jobs"}&title=${encodeURIComponent(job?.title ?? "")}`;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* ── Desktop table (lg+) ─────────────────────────────────────────── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableBody>
            {allJobs.map((job) => (
              <JobsTableRow
                key={job.id}
                job={job}
                session={sessions[job.id]}
                extState={extState}
                onApply={() => apply(job)}
                onResume={() => resume(job.id)}
                onViewQA={() => viewQA(job.id)}
                onEmailApply={handleEmailApply}
                onFocusExtTab={() => focusExtTab(job.id)}
                onBookmark={() =>
                  toggleBookmark.mutate({
                    jobId: job?.id,
                    isBookmarked: job?.isBookmarked ?? false,
                  })
                }
                onRowClick={() => router.push(jobUrl(job))}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile cards (< lg) ─────────────────────────────────────────── */}
      <div className="lg:hidden mt-4">
        <div className="space-y-4">
          {allJobs.map((job) => (
            <MobileJobCard
              key={job.id}
              job={job}
              session={sessions[job.id]}
              onApply={() => apply(job)}
              onResume={() => resume(job.id)}
              onViewQA={() => viewQA(job.id)}
              onEmailApply={handleEmailApply}
              onBookmark={() =>
                updateJobs.mutate({
                  id: String(job.id),
                  data: { isBookmarked: !job.isBookmarked },
                })
              }
              onRowClick={() => router.push(jobUrl(job))}
            />
          ))}
        </div>
      </div>

      {/* ── Q&A drawer — shown after "View questions & answers" is clicked ── */}
      {qaSession?.applicationQA && qaJob && (
        <BotStatusDrawer
          jobTitle={qaJob.title ?? "Job"}
          qa={qaSession.applicationQA}
          onClose={dismissQA}
        />
      )}
    </div>
  );
}
