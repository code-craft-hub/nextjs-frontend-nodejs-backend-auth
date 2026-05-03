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
  const updateJobs = useUpdateJobMutation();

  const {
    sessions,
    extState,
    qaJobId,
    apply,
    resume,
    viewQA,
    dismissQA,
    focusExtTab,
    handleEmailApply,
  } = orchestrator;

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
