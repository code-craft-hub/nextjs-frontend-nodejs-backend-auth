import React from "react";
import { ChevronRight, PlusIcon } from "lucide-react";
import ProfileManagementModal from "./modal";
import { Button } from "@/components/ui/button";
import { IUser } from "@/types";

export interface ProfileData {
  id: string;
  title: string;
  description: string;
  date: string;
  key?: string;
  data?: string;
}

const profilesData: ProfileData[] = [
  {
    id: "1",
    title: "Product Management",
    description:
      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.",
    date: "July 12th, 2012",
  },
  {
    id: "2",
    title: "Product Management",
    description:
      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.",
    date: "July 12th, 2012",
  },
  {
    id: "3",
    title: "Product Management",
    description:
      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint.",
    date: "July 12th, 2012",
  },
];

const ProfileCard: React.FC<{ profile: ProfileData }> = ({ profile }) => {
  console.log("PROFILE CARD RENDERED: ", profile);
  return (
    <div className="bg-white rounded-lg font-inter border border-gray-200  mb-4">
      <div className="p-6">
        <h3 className="text-md font-medium mb-3 capitalize">
          {profile?.title ?? profile?.key}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-3">
          {profile?.description ?? profile?.data}
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

export const ProfileManagement: React.FC<{ user: Partial<IUser> }> = ({
  user,
}) => {
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
            Active Profiles ({profilesData.length})
          </h2>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        {user?.dataSource?.map((profile) => (
          <ProfileCard key={profile.profileID} profile={profile} />
        ))}
      </div>
      <ProfileManagementModal >
        <div className="border-2 border-dashed p-4 items-center justify-center flex border-blue-500 rounded-lg mb-8">
          <div className="gap-2 flex">
            <PlusIcon className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500 font-medium">Add new profile</span>
          </div>
        </div>
      </ProfileManagementModal>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button className="">Save Settings</Button>
      </div>
    </div>
  );
};
