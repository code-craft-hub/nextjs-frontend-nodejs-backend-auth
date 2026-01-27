import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import AuthorizeGoogle from "../../../hooks/gmail/AuthorizeGoogle";
import { toast } from "sonner";
// import { onboardingApi } from "@/lib/api/onboarding.api";
import { FileUploadZone } from "@/app/onboarding/onboarding-pages/AnyFormatToText";
import { ProfileCard } from "./ProfileCard";
import { useResumeUploadWithProgress } from "@/hooks/useResumeUploadWithProgress";
import { queryKeys } from "@/lib/query/keys";

export const ProfileManagement: React.FC = () => {
  const { data: user } = useQuery(userQueries.detail());
  const [loading, _setLoading] = useState(false);
  const queryClient = useQueryClient();
  const {
    uploadResume,
    progress,
    isUploading,
    error: uploadError,
  } = useResumeUploadWithProgress();

  const handleFileSelect = useCallback(
    async (file: File) => {
      // clearError();

      const result = await uploadResume(file);

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        toast.success(`${user?.firstName}, your resume is saved!`);
      } else {
        toast.error(result.error || "Failed to upload resume");
      }
    },
    [uploadResume, user?.firstName]
  );

  // const handleFileSelect = useCallback(async (file: File) => {
  //   setLoading(true);
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   const result = await onboardingApi.createFirstProfile(formData);
  //   if (result?.success) {
  //     toast.success(`${data?.firstName}, your resume is saved!`);
  //     await queryClient.invalidateQueries(userQueries.detail());
  //   }
  //   setLoading(false);
  // }, []);

  const progressPercentage = progress?.progress || 0;
console.log("User Data Source:", user?.dataSource);
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
            Active Profiles ({user?.dataSource?.length ?? 0})
          </h2>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        {user?.dataSource?.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} dataSource={user} />
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
      {/* Progress indicator */}
      {isUploading && progress && (
        <div className="w-full space-y-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">
              {progress.message}
            </span>
            <span className="text-gray-500">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
      <div className="hidden">
        <AuthorizeGoogle />
      </div>
    </div>
  );
};
