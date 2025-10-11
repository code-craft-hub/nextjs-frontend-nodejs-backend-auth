"use client";
import { useResumeData } from "@/hooks/use-resume-data";
import { ResumePreview } from "./form/ResumePreview";
import { useAuth } from "@/hooks/use-auth";
import { Resume } from "@/types";

const EditResumeTemplate: React.FC<{ documentId: string }> = ({
  documentId,
}) => {

  const {user, useCareerDoc} = useAuth();
  const { data } = useCareerDoc<Resume>(documentId);

  const { 
    resumeData, 
    updateField, 
    isUpdating, 
    error,
    reset 
  } = useResumeData(data || {}, {
    documentId,
    onSuccess: (field) => {
      console.log(`✓ Successfully updated ${field}`);
    },
    onError: (error, field) => {
      console.error(`✗ Failed to update ${field}:`, error);
    },
  })
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <div>
              <strong className="font-semibold">Error: </strong>
              {error.message}
            </div>
            <button
              onClick={() => reset()}
              className="text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
        <ResumePreview
          data={resumeData}
          user={user ?? null}
          onUpdate={updateField}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
};

export default EditResumeTemplate;