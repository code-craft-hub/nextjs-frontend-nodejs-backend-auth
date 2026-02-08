import { useDeleteDataSourceWithGCS } from "@/lib/mutations/profile.mutations";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileManagementModal from "./ProfileManagementModal";
import { ProfileData } from "@/types";

export const ProfileCard: React.FC<{
  profile: ProfileData;
  dataSource: any;
}> = ({ profile, dataSource }) => {
  const deleteDataSource = useDeleteDataSourceWithGCS();
  const isDefault = dataSource?.defaultDataSource === profile.id;
  console.log("Rendering ProfileCard with profile:", profile);
  return (
    <div
      className={cn(
        "bg-white rounded-lg font-inter border border-gray-200  mb-4 relative",
        //  isDefault && "shadow-xl shadow-blue-100"
      )}
    >
      <div className="absolute top-4 right-2 flex">
        <Button
          onClick={() => {
            deleteDataSource.mutate({
              profileId: profile.id,
            });
          }}
          variant={"ghost"}
          className=""
        >
          <Trash className="w-4 h-4 text-red-600" />
        </Button>
      </div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <h3
            className={cn(
              "text-md items-center gap-1 font-medium capitalize",
              isDefault && "ml-4",
            )}
          >
            {profile?.title ??
              profile?.key ??
              profile?.rolesOfInterest
                ?.slice(0, 2)
                ?.map((role) => role.label)
                .join(", ") ??
              profile?.originalName ??
              "Untitled Profile"}
            {isDefault && (
              <span>
                <Sparkles
                  className={cn(
                    "size-4 ml-2",
                    "text-yellow-500 [svg]:fill absolute top-7 left-2",
                  )}
                />
              </span>
            )}
          </h3>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-3">
          {profile?.description ||
            profile?.data ||
            profile?.profile ||
            "No description available."}
        </p>
        <p className="text-gray-400 text-sm">{profile.date}</p>
      </div>
      <div className="border-t p-4">
        <ProfileManagementModal profile={profile} dataSource={dataSource}>
          <button className="flex items-center justify-between w-full text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
            <span>Edit Profile</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </ProfileManagementModal>
      </div>
    </div>
  );
};
