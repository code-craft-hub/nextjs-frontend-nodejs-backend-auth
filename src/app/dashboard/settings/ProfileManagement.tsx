import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import AuthorizeGoogle from "../../../hooks/gmail/AuthorizeGoogle";
import { toast } from "sonner";
import { FileUploadZone } from "@/app/onboarding/onboarding-pages/AnyFormatToText";
import { ProfileCard } from "./ProfileCard";
import { useResumeUploadWithProgress } from "@/hooks/useResumeUploadWithProgress";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { queryKeys } from "@/lib/query/keys";

export const ProfileManagement: React.FC = () => {
  const { data: user } = useQuery(userQueries.detail());
  const [loading, _setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: uploadedResumes } = useQuery(resumeQueries.uploaded());
  const { uploadResume, error: uploadError } = useResumeUploadWithProgress();

  const handleFileSelect = async (file: File) => {
    await toast.promise(uploadResume(file), {
      loading: "Preparing your resume...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        queryClient.invalidateQueries({
          queryKey: resumeQueries.uploaded().queryKey,
        });
        return `${user?.firstName}, your resume is saved!`;
      },
      error: (error) =>
        "Failed to upload resume" +
        (error instanceof Error ? `: ${error.message}` : ""),
    });
  };

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
            {/* Active Profiles ({uploadedResumes?.length ?? 0}) */}
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
        disabled={loading}
        currentFile={null}
        onClearFile={() => {}}
        profile={true}
      />

      {uploadError && (
        <div className="text-red-500 w-full p-3 bg-red-50 rounded-md">
          {typeof uploadError === "string"
            ? uploadError
            : "Failed to process document. Please try again."}
        </div>
      )}

      <div className="hidden">
        <AuthorizeGoogle />
      </div>
    </div>
  );
};
