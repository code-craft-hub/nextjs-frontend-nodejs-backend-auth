import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { JobType } from "@/types";
import { buildAutoApplyStartUrl } from "@/lib/utils/ai-apply-navigation";
import { gmailApi } from "@/lib/api/gmail.api";
import { useDefaultResumeGuard } from "@/hooks/useDefaultResumeGuard";

export function useJobActions() {
  const router = useRouter();
  const { requireDefaultResume } = useDefaultResumeGuard();

  const handleJobClick = useCallback(
    async (job: JobType) => {
      if (!job?.emailApply) {
        // @ts-ignore
        window.open(job.link ? job.link : job.applyUrl, "__blank");
        return;
      }

      if (!requireDefaultResume()) return;

      const { authorized } = await gmailApi.checkAuthStatus();

      if (!authorized) {
        toast.error(
          "✨ Go to the Settings page and enable authorization for Cver AI to send emails on your behalf. This option is located in the second card.",
          {
            action: {
              label: "Authorize now",
              onClick: () =>
                router.push(`/dashboard/settings?tab=ai-applypreference`),
            },
            classNames: {
              actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
            },
          },
        );
        return;
      }

      const startUrl = buildAutoApplyStartUrl(
        job.descriptionText || "",
        job.emailApply || "",
        job.id,
      );
      router.push(startUrl);
    },
    [router, requireDefaultResume],
  );

  const handlePreview = useCallback(
    (job: JobType) => {
      router.push(
        `/dashboard/jobs/${job.id}?referrer=dashboard&title=${job.title}`,
      );
    },
    [router],
  );

  return {
    handleJobClick,
    handlePreview,
  };
}
