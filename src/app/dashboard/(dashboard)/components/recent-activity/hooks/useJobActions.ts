import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiService } from "@/hooks/use-auth";
import { JobType } from "@/types";
import { buildAutoApplyStartUrl } from "@/lib/utils/ai-apply-navigation";

export function useJobActions() {
  const router = useRouter();

  const handleJobClick = useCallback(
    async (job: JobType) => {
      if (!job?.emailApply) {
        window.open(job.link ? job.link : job.applyUrl, "__blank");
        return;
      }

      const { authorized } = await apiService.gmailOauthStatus();

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

      // const params = new URLSearchParams();
      // params.set("jobDescription", JSON.stringify(job?.descriptionText || ""));
      // params.set("recruiterEmail", encodeURIComponent(job?.emailApply));

      const startUrl = buildAutoApplyStartUrl(
        job.descriptionText || "",
        job.emailApply || "",
      );
      router.push(startUrl);
    },
    [router],
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
