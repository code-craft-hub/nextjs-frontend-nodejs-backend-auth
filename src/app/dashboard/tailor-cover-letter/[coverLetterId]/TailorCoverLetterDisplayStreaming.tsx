"use client";

import { Loader2 } from "lucide-react";

interface TailorCoverLetterDisplayProps {
  aiApply: boolean;
  state: {
    isStreaming: boolean;
    content: string;
    error: string | null;
  };
  displayUser: {
    firstName: string;
    lastName: string;
    title: string;
    phoneNumber: string;
  };
  displayContent: string;
  contentRef: React.RefObject<HTMLDivElement>;
}

export const TailorCoverLetterDisplayStreaming = ({
  state,
  displayUser,
  displayContent,
  contentRef,
}: TailorCoverLetterDisplayProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {/* {aiApply && <ProgressIndicator activeStep={1} />} */}
      <div className="flex w-full gap-3 items-center p-4 bg-white justify-between">
        <p className="text-xl font-medium font-inter">Tailored Cover Letter</p>
      </div>

      <div className="bg-slate-50 border-b border-slate-200 shadow-md rounded-xl flex flex-col items-center justify-between">
        <div
          ref={contentRef}
          className="bg-white p-4 sm:p-8 overflow-y-auto w-full"
        >
          {state.isStreaming && !state.content ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-sm">Generating your cover letter...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-outfit text-md flex flex-col gap-2">
              <div className="mb-4">
                <p className="text-xl font-medium font-inter">
                  {displayUser.firstName} {displayUser.lastName}
                </p>
                <p className="text-sm font-inter">{displayUser.title}</p>
              </div>
              <p className="text-sm font-bold font-inter">
                Dear Hiring Manager,
              </p>
              <p className="text-sm">{displayContent}</p>
              {displayContent && (
                <div className="mt-8">
                  <p>Sincerely</p>
                  <p>
                    {displayUser.firstName} {displayUser.lastName}
                  </p>
                  <p>{displayUser.phoneNumber}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {state.error && (
          <div className="text-red-500 p-4 shadow-xl w-full">
            Error: {state.error}
          </div>
        )}      
      </div>
    </div>
  );
};
