"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUpdateJobApplicationHistoryMutation } from "@/features/jobs/mutations/jobs.mutations";
import { gmailApi } from "@/features/email-application/api/gmail.api";
import { buildAutoApplyStartUrl } from "@/lib/utils/ai-apply-navigation";
import { useSubmitBrowserApplicationMutation } from "@/features/browser-automation";

export interface ApplicableJob {
  id: string;
  emailApply?: string | null;
  applyUrl?: string | null;
  link?: string | null;
  descriptionText?: string | null;
}

const MANUAL_APPLY_DOMAINS = ["linkedin.com", "glassdoor.com", "indeed.com"];

function isManualApplyUrl(url: string): boolean {
  return MANUAL_APPLY_DOMAINS.some((domain) => url.includes(domain));
}

/**
 * Single source of truth for the "apply to job" side-effect.
 *
 * Callbacks for bot flow (matching the reference pattern exactly):
 *   onBotStarting(jobId)                    — called BEFORE the API request so
 *                                             the caller can show the spinner immediately
 *   onBotStarted(jobId, applicationId, liveUrl) — called AFTER a successful response
 *                                             so the caller can open the SSE poller
 *
 * onApplied(jobId) — called for manual-open and email-apply flows (hides the row)
 */
export function useApplyJob() {
  const router = useRouter();
  const { mutate: recordApplication } = useUpdateJobApplicationHistoryMutation();
  const { mutateAsync: submitBrowserApplication } = useSubmitBrowserApplicationMutation();

  const applyToJob = useCallback(
    async (
      job: ApplicableJob,
      e?: React.MouseEvent,
      onBotStarting?: (jobId: string) => void,
      onBotStarted?: (jobId: string, applicationId: string, liveUrl: string) => void,
    ) => {
      e?.preventDefault();
      e?.stopPropagation();

      try {
        const link = job.applyUrl || job.link;

        // ── Browser-automation apply ───────────────────────────────────────────
        if (!job.emailApply) {
          if (!link) {
            toast.error("No application URL found for this job.");
            return;
          }

          if (isManualApplyUrl(link)) {
            window.open(link, "_blank", "noopener,noreferrer");
            recordApplication({ id: String(job.id), data: { appliedJobs: job.id } });
            return;
          }

          // Show spinner BEFORE the API call (mirrors reference flow)
          onBotStarting?.(job.id);

          let data;
          try {
            const res = await submitBrowserApplication({ jobId: job.id });
            data = res.data;
          } catch {
            // On API error clear the starting state by calling with empty values
            onBotStarted?.(job.id, "", "");
            toast.error("Failed to start automation. Please try again.");
            return;
          }

          recordApplication({ id: String(job.id), data: { appliedJobs: job.id } });

          if (data.deduplicated) {
            toast.success("Your application is already being processed.", { duration: 4000 });
          } else {
            toast.success("Bot started — watch it apply live.", { duration: 4000 });
          }

          // Transition to "running" — this triggers the SSE poller
          onBotStarted?.(job.id, data.jobApplicationId, data.liveUrl);
          return;
        }

        // ── AI / email apply ───────────────────────────────────────────────────
        const { authorized } = await gmailApi.checkAuthStatus();

        if (!authorized) {
          toast.error(
            "✨ Go to Settings and authorize Cver AI to send emails on your behalf.",
            {
              action: {
                label: "Authorize now",
                onClick: () => router.push("/dashboard/settings?tab=ai-applypreference"),
              },
              classNames: {
                actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
              },
            },
          );
          return;
        }

        recordApplication({ id: String(job.id), data: { appliedJobs: job.id } });

        const startUrl = buildAutoApplyStartUrl(
          JSON.stringify(job.descriptionText ?? ""),
          encodeURIComponent(job.emailApply),
        );
        router.push(startUrl);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    },
    [router, recordApplication, submitBrowserApplication],
  );

  return { applyToJob };
}
