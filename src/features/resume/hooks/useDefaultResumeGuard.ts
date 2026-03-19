import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { resumeQueries } from "@/features/resume/queries/resume.queries";

const PROFILE_MANAGEMENT_URL = "/dashboard/settings?tab=profile-management";

/**
 * Guards document generation features behind a default uploaded resume.
 *
 * Returns a `requireDefaultResume()` function that:
 * - Returns `true`  → user has a default resume, safe to proceed
 * - Returns `false` → no default resume; shows a toast with a redirect action
 *
 * Usage:
 *   const { requireDefaultResume } = useDefaultResumeGuard();
 *   if (!requireDefaultResume()) return;
 */
export function useDefaultResumeGuard() {
  const router = useRouter();
  const { data: uploadedResumes, isLoading } = useQuery(
    resumeQueries.uploaded(),
  );

  const hasDefaultResume =
    !isLoading && (uploadedResumes ?? []).some((r) => r.isDefault);

  const requireDefaultResume = useCallback((): boolean => {
    if (isLoading) return false;

    if (hasDefaultResume) return true;

    toast.warning("No default resume found", {
      description:
        "Upload a resume and set it as your default before generating documents.",
      action: {
        label: "Upload Resume",
        onClick: () => router.push(PROFILE_MANAGEMENT_URL),
      },
      duration: 6000,
      classNames: {
        actionButton: "!bg-blue-600 hover:!bg-blue-700 !text-white !h-8",
      },
    });

    return false;
  }, [hasDefaultResume, isLoading, router]);

  return { hasDefaultResume, isLoading, requireDefaultResume };
}
