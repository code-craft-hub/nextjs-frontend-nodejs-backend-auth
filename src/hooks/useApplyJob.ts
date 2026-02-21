"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUpdateJobApplicationHistoryMutation } from "@/lib/mutations/jobs.mutations";
import { gmailApi } from "@/lib/api/gmail.api";
import { buildAutoApplyStartUrl } from "@/lib/utils/ai-apply-navigation";

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
 * Handles:
 *  - Regular apply  → records application + opens link in new tab
 *  - Email/AI apply → checks Gmail auth, records application, navigates to
 *                     the tailor-cover-letter flow with aiApply=true
 *
 * All errors are caught and surfaced as toast notifications so callers
 * never need their own try/catch.
 */
export function useApplyJob() {
  const router = useRouter();
  const { mutate: recordApplication } =
    useUpdateJobApplicationHistoryMutation();

  const applyToJob = useCallback(
    async (job: ApplicableJob, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      try {
        const link = job.applyUrl || job.link;

        // ── Regular apply (no email) ───────────────────────────────────────
        if (!job.emailApply) {
          recordApplication({
            id: String(job.id),
            data: { appliedJobs: job.id },
          });
          window.open(link ?? "", "_blank", "noopener,noreferrer");
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
    [router, recordApplication],
  );

  return { applyToJob };
}
