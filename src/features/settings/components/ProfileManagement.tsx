import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import AuthorizeGoogle from "@/features/email-application/hooks/AuthorizeGoogle";
import { FileUploadZone } from "@/features/onboarding/components/onboarding-pages/AnyFormatToText";
import { ProfileCard } from "./ProfileCard";
import { useResumeUploadWithProgress } from "@/features/resume/hooks/useResumeUploadWithProgress";
import { resumeQueries } from "@/features/resume/queries/resume.queries";
import { queryKeys } from "@/shared/query/keys";

export const ProfileManagement: React.FC = () => {
  const { data: user } = useQuery(userQueries.detail());
  const queryClient = useQueryClient();

  const { data: uploadedResumes } = useQuery(resumeQueries.uploaded());
  const { uploadResume, retry, progress, isUploading, error } =
    useResumeUploadWithProgress();

  // The failed ingestion the Retry button acts on. Only set on the async path —
  // the legacy SSE path has no ingestionId, so no retry affordance is shown.
  const [failedIngestionId, setFailedIngestionId] = useState<string | null>(
    null,
  );
  const [justSucceeded, setJustSucceeded] = useState(false);

  const refreshProfiles = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    queryClient.invalidateQueries({
      queryKey: resumeQueries.uploaded().queryKey,
    });
  };

  const onResult = (result: {
    success: boolean;
    data?: { ingestionId?: string };
  }) => {
    if (result.success) {
      setFailedIngestionId(null);
      setJustSucceeded(true);
      refreshProfiles();
      toast.success(`${user?.firstName ?? "Your"} resume is ready!`);
      // Clear the success banner shortly after — the new profile card is the
      // durable confirmation.
      setTimeout(() => setJustSucceeded(false), 6000);
    } else {
      setJustSucceeded(false);
      setFailedIngestionId(result.data?.ingestionId ?? null);
    }
  };

  const handleFileSelect = async (file: File) => {
    setFailedIngestionId(null);
    setJustSucceeded(false);
    onResult(await uploadResume(file));
  };

  const handleRetry = async () => {
    if (!failedIngestionId) return;
    onResult(await retry(failedIngestionId));
  };

  const pct = Math.max(0, Math.min(100, progress?.progress ?? 0));
  const showError = !isUploading && !!error;

  return (
    <div className="font-inter">
      {/* Header */}
      <div className="mb-8 bg-white p-4">
        <h1 className="text-md font-medium text-gray-900 mb-2">
          Profile Management
        </h1>
        <p className="text-gray-600">
          Manage your profile and set your job preferences for each profile
        </p>
        <div className="mt-2">
          <h2 className="font-medium text-gray-900">
            Active Profiles ({uploadedResumes?.length ?? 0})
          </h2>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        {uploadedResumes?.map((profile) => (
          <ProfileCard key={profile.id} resume={profile} />
        ))}
      </div>

      <FileUploadZone
        onFileSelect={handleFileSelect}
        disabled={isUploading}
        currentFile={null}
        onClearFile={() => {}}
        profile={true}
      />

      {/* ── Upload status ─────────────────────────────────────────────── */}

      {/* In progress */}
      {isUploading && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-blue-800">
              <Loader2 className="size-4 animate-spin" />
              {progress?.message ?? "Processing your resume…"}
            </span>
            <span className="tabular-nums text-blue-600">{pct}%</span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Succeeded (transient confirmation) */}
      {justSucceeded && !isUploading && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-800">
          <CheckCircle2 className="size-4 text-green-600" />
          Your resume was processed and added to your profiles.
        </div>
      )}

      {/* Failed */}
      {showError && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                We couldn't process this resume
              </p>
              <p className="mt-0.5 text-sm text-red-600">{error}</p>

              {failedIngestionId ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isUploading}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className="size-3.5" />
                  Try again
                </button>
              ) : (
                <p className="mt-2 text-xs text-red-500">
                  Please re-select the file to try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="hidden">
        <AuthorizeGoogle />
      </div>
    </div>
  );
};
