import React from "react";
import { BookmarkIcon, ChevronRight, PlusIcon, Trash } from "lucide-react";
import ProfileManagementModal from "./modal";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { useDeleteDataSource } from "@/lib/mutations/profile.mutations";
import { cn } from "@/lib/utils";

export interface ProfileData {
  id: string;
  title: string;
  description: string;
  date: string;
  key?: string;
  data?: string;
  jobLevelPreference?: string;
  jobTypePreference?: string;
  roleOfInterest?: { label: string; value: string }[];
  remoteWorkPreference?: string;
  relocationWillingness?: string;
  location?: string;
  salaryExpectation?: string;
  availabilityToStart?: string;
  defaultDataSource?: string;
  profileID?: string;
  activeDataSource?: string;
}

const ProfileCard: React.FC<{ profile: ProfileData; dataSource: any }> = ({
  profile,
  dataSource,
}) => {
  const deleteDataSource = useDeleteDataSource();
  return (
    <div className="bg-white rounded-lg font-inter border border-gray-200  mb-4 relative">
      <div className="absolute top-2 right-2 flex">
        <Button
          onClick={() => {
            deleteDataSource.mutate();
          }}
          variant={"ghost"}
          className=""
        >
          <Trash className="w-4 h-4 text-red-600" />
        </Button>
      </div>

      <div className="p-6">
        <div className="flex items-center mb-4">
          <h3 className="text-md font-medium capitalize">
            {profile?.title ??
              profile?.key ??
              profile?.roleOfInterest
                ?.slice(0, 2)
                ?.map((role) => role.label)
                .join(", ")}
          </h3>
          <BookmarkIcon
            className={cn(
              "size-5 ml-2",
              dataSource?.activeDataSource === profile.profileID
                ? "text-primary [svg]:fill-primary"
                : "text-gray-300"
            )}
          />
          {JSON.stringify({
            active: profile.activeDataSource,
            profileID: profile.profileID,
            dataSource: dataSource?.activeDataSource,
          })}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-3">
          {profile?.description || profile?.data || "No description available."}
        </p>
        <p className="text-gray-400 text-sm">{profile.date}</p>
      </div>
      <div className="border-t p-4">
        <ProfileManagementModal profile={profile}>
          <button className="flex items-center justify-between w-full text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
            <span>Edit Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </ProfileManagementModal>
      </div>
    </div>
  );
};

export const ProfileManagement: React.FC = () => {
  const { data } = useQuery(userQueries.detail());
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
            Active Profiles ({data?.dataSource?.length})
          </h2>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        {data?.dataSource?.map((profile) => (
          <ProfileCard
            key={profile.profileID}
            profile={profile}
            dataSource={data}
          />
        ))}
      </div>
      <ProfileManagementModal>
        <div className="border-2 border-dashed p-4 items-center justify-center flex border-blue-500 rounded-lg mb-8">
          <div className="gap-2 flex">
            <PlusIcon className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500 font-medium">Add new profile</span>
          </div>
        </div>
      </ProfileManagementModal>

      <div className="flex justify-end">
        <Button className="">Save Settings</Button>
      </div>
    </div>
  );
};
