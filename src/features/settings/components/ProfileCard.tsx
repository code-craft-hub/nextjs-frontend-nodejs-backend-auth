import { Button } from "@/components/ui/button";
import { ChevronRight, Edit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeAggregate } from "@/shared/types/resume.types";
import { formatAppliedDate } from "@/lib/utils/helpers";
import { useState } from "react";
import CreateUserResume from "@/features/onboarding/components/onboarding-pages/create-resume-form/CreateUserResume";
import { ViewResume, DownloadResume } from "@/features/account/components/download-view-resume";

export const ProfileCard: React.FC<{
  resume: ResumeAggregate;
}> = ({ resume }) => {
  const [editResume, setEditResume] = useState(false);
  const handleEditClick = (value: boolean) => setEditResume(value);

  const hasOriginal = !!resume.gcsPath;
  const originalName = resume.originalName ?? resume.fileName ?? resume.title ?? "original-resume";
  const fileName = resume.fileName ?? resume.title ?? "document";

  return (
    <div className={cn("bg-white rounded-lg font-inter border border-gray-200 mb-4 relative")}>
      {editResume ? (
        <CreateUserResume
          resumeId={resume.id}
          data={resume}
          handleEditClick={handleEditClick}
        />
      ) : (
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

          {/* Desktop action buttons */}
          <div className="hidden sm:absolute sm:top-4 sm:flex gap-1 right-2">
            <ViewResume resumeId={resume.id} hasOriginal={hasOriginal} />
            <DownloadResume
              resumeId={resume.id}
              hasOriginal={hasOriginal}
              originalName={originalName}
              fileName={fileName}
            />
            <Button onClick={() => handleEditClick(true)}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {/* Footer row */}
          <div className="border-t p-4">
            <div className="flex gap-4 justify-between items-center">
              <button
                onClick={() => handleEditClick(true)}
                className="flex items-center justify-between text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                <span>Edit Profile</span>
              </button>
              <div className="flex gap-2 items-center">
                {/* Mobile action buttons */}
                <ViewResume resumeId={resume.id} hasOriginal={hasOriginal} className="sm:hidden" />
                <DownloadResume
                  resumeId={resume.id}
                  hasOriginal={hasOriginal}
                  originalName={originalName}
                  fileName={fileName}
                  className="sm:hidden"
                />
                <ChevronRight
                  onClick={() => handleEditClick(true)}
                  className="size-6 text-blue-500 max-sm:hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
