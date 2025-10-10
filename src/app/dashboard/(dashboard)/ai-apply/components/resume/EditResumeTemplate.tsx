"use client";
import { useResumeData } from "@/hooks/use-resume-data";
import { ResumePreview } from "./form/ResumePreview";
import { useAuth } from "@/hooks/use-auth";

const EditResumeTemplate: React.FC<{ documentId: string }> = ({
  documentId,
}) => {

  const {useCareerDoc} = useAuth();
  const { data } = useCareerDoc(documentId);

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
  });

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
  //     </div>
  //   );
  // }

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
          onUpdate={updateField}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
};

export default EditResumeTemplate;