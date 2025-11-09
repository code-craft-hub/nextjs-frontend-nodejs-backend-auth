import React, { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import AuthorizeGoogle from "./(google-gmail-authorization)/AuthorizeGoogle";
import { toast } from "sonner";
import { onboardingApi } from "@/lib/api/onboarding.api";
import { FileUploadZone } from "@/app/onboarding/onboarding-pages/AnyFormatToText";
import { ProfileCard } from "./ProfileCard";

export const ProfileManagement: React.FC = () => {
  const { data } = useQuery(userQueries.detail());
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileSelect = useCallback(async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await onboardingApi.createFirstProfile(formData);
    if (result?.success) {
      toast.success(`${data?.firstName}, your resume is saved!`);
      await queryClient.invalidateQueries(userQueries.detail());
    }
    setLoading(false);
  }, []);
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
            Active Profiles ({data?.dataSource?.length ?? 0})
          </h2>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        {data?.dataSource?.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} dataSource={data} />
        ))}
      </div>
      <FileUploadZone
        onFileSelect={handleFileSelect}
        disabled={loading}
        currentFile={null}
        onClearFile={() => {}}
        profile={true}
      />
      <div className="hidden">
        <AuthorizeGoogle />
      </div>
    </div>
  );
};
