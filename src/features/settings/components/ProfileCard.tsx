import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Download,
  Edit,
  Eye,
  Loader,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileManagementModal from "./ProfileManagementModal";
import { ResumeAggregate } from "@/shared/types/resume.types";
import { formatAppliedDate } from "@/lib/utils/helpers";
// import { useDeleteResumeMutation } from "@/features/resume/mutations/resume.mutations";
import { useState } from "react";
import CreateUserResume from "@/features/onboarding/components/onboarding-pages/create-resume-form/CreateUserResume";
import { useResumeDownload } from "@/hooks/resume/useResumeDownload";

export const ProfileCard: React.FC<{
  resume: ResumeAggregate;
}> = ({ resume }) => {
  const [editResume, setEditResume] = useState(false);
  const handleEditClick = (value: boolean) => {
    setEditResume(value);
  };
  const { download, preview, isDownloading, isPreviewing, error } =
    useResumeDownload();

  return (
    <div
      className={cn(
        "bg-white rounded-lg font-inter border border-gray-200  mb-4 relative",
        //  isDefault && "shadow-xl shadow-blue-100"
      )}
    >
      <div className="absolute top-4 grid grid-cols-3 gap-2 right-2 ">
        <Button
          onClick={() => {
            download(resume.id, resume.fileName ?? resume.title ?? "document");
          }}
          variant={"ghost"}
          className=""
        >
          {isDownloading ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={() => {
            preview(resume.id);
          }}
          variant={"ghost"}
          className=""
        >
          {isPreviewing ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
        <Button
          onClick={() => {
            handleEditClick(true);
          }}
          className=""
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      {editResume ? (
        <CreateUserResume
          resumeId={resume.id}
          data={resume}
          handleEditClick={handleEditClick}
        />
      ) : (
        <ProfileManagementModal resume={resume}>
          <div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <h3
                  className={cn(
                    "text-md items-center gap-1 font-medium capitalize",
                    resume.isDefault && "ml-4",
                  )}
                >
                  {resume?.title || "Untitled Profile"}
                  {resume.isDefault && (
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
                {resume?.summary || "No description available."}
              </p>
              <p className="text-gray-400 text-sm">
                {formatAppliedDate(resume.createdAt)}
              </p>
            </div>
            <div className="border-t p-4">
              <button className="flex items-center justify-between w-full text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                <span>Edit Profile</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ProfileManagementModal>
      )}
      {error && (
        <div className="mt-2.5 p-4 text-[12px] font-medium text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};
