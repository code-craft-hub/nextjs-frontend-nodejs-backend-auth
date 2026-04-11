"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUpdateJobApplicationHistoryMutation } from "@/features/jobs/mutations/jobs.mutations";
import { gmailApi } from "@/features/email-application/api/gmail.api";
import { buildAutoApplyStartUrl } from "@/lib/utils/ai-apply-navigation";
import { useSubmitBrowserApplicationMutation } from "@/features/browser-automation";

/**
 * Minimal shape required to apply to a job.
 * Both JobPost and JobType satisfy this interface.
 */
export interface ApplicableJob {
  id: string;
  emailApply?: string | null;
  applyUrl?: string | null;
  link?: string | null;
  descriptionText?: string | null;
}

/**
 * Single source of truth for the "apply to job" side-effect.
 *
 * Handles three cases:
 *
 * 1. **Browser-automation apply** (no emailApply, has applyUrl/link)
 *    → Enqueues a BullMQ job that navigates to the URL, fills the form with
 *      the user's profile, and submits it — all in the background.
 *      Records the application and surfaces a toast immediately so the user
 *      can keep browsing.
 *
 * 2. **Email / AI apply** (emailApply present)
 *    → Checks Gmail auth, records application, then navigates to the
 *      tailor-cover-letter flow with aiApply=true.
 *
 * 3. **No URL, no email** — surfaces an error toast; nothing is recorded.
 *
 * All errors are caught and surfaced as toast notifications so callers
 * never need their own try/catch.
 */
export function useApplyJob() {
  const router = useRouter();
  const { mutate: recordApplication } = useUpdateJobApplicationHistoryMutation();
  const { mutateAsync: submitBrowserApplication } =
    useSubmitBrowserApplicationMutation();

  const applyToJob = useCallback(
    async (job: ApplicableJob, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      try {
        const link = job.applyUrl || job.link;

        // ── Browser-automation apply (no email, URL present) ───────────────
        if (!job.emailApply) {
          if (!link) {
            toast.error("No application URL found for this job.");
            return;
          }

          const { data } = await submitBrowserApplication({ jobId: job.id });

          // Record in the user's applied-jobs history so the dashboard count
          // stays accurate without waiting for the background job to finish.
          recordApplication({
            id: String(job.id),
            data: { appliedJobs: job.id },
          });

          toast.success(
            data.deduplicated
              ? "Your application is already being processed in the background."
              : "Applying automatically in the background — we'll handle the form for you.",
            { duration: 5000 },
          );

          return;
        }

        // ── AI / email apply ───────────────────────────────────────────────
        const { authorized } = await gmailApi.checkAuthStatus();

        if (!authorized) {
          toast.error(
            "✨ Go to Settings and authorize Cver AI to send emails on your behalf.",
            {
              action: {
                label: "Authorize now",
                onClick: () =>
                  router.push("/dashboard/settings?tab=ai-applypreference"),
              },
              classNames: {
                actionButton:
                  "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
              },
            },
          );
          return;
        }

        // Record only after confirming the user is authorized.
        recordApplication({
          id: String(job.id),
          data: { appliedJobs: job.id },
        });

        const params = {
          jobDescription: JSON.stringify(job.descriptionText ?? ""),
          recruiterEmail: encodeURIComponent(job.emailApply),
        };

        const startUrl = buildAutoApplyStartUrl(
          params.jobDescription,
          params.recruiterEmail,
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
