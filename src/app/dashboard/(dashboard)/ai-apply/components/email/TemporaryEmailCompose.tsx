"use client";
import React, { useRef, useEffect, memo } from "react";
import { Loader2 } from "lucide-react";
import { useCoverLetterGenerator } from "@/hooks/useCoverLetterGenerator";
import { useAuth } from "@/hooks/use-auth";
import {  useRouter } from "next/navigation";
import { createCoverLetterOrderedParams } from "@/lib/utils/helpers";
import { toast } from "sonner";
import { isEmpty } from "lodash";
import { COLLECTIONS } from "@/lib/utils/constants";
import { v4 as uuidv4 } from "uuid";

export const TemporaryEmailCompose = memo<{
  jobDescription: string;
  coverLetterId: string;
  aiApply?: boolean;
}>(({ jobDescription, coverLetterId, aiApply }) => {

  const { generatedContent, isGenerating, error, generateCoverLetter } =
    useCoverLetterGenerator();

  const contentRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);

  const { user, useCareerDoc } = useAuth();
  const { data, isFetched, status } = useCareerDoc<{ coverLetter: string }>(
    coverLetterId,
    COLLECTIONS.COVER_LETTER
  );
  const router = useRouter();


  useEffect(() => {
   

    if (isFetched && status === "success") {
      if (user && jobDescription && !hasGeneratedRef.current && !data) {
        hasGeneratedRef.current = true;

        toast.promise(
          generateCoverLetter({ user, jobDescription, coverLetterId }),
          {
            loading: "Generating your tailored cover letter...",
            success: () => {
              return {
                message: "Cover letter generation complete!",
              };
            },
            error: "Failed to generate cover letter",
          }
        );

        if (aiApply) {
          const orderedParams = createCoverLetterOrderedParams(
            coverLetterId,
            jobDescription
          );
          router.push(
            `/dashboard/resume/${uuidv4()}?${orderedParams.toString()}`
          );
        }
      }
    }
  }, [
    user,
    jobDescription,
    data,
    aiApply,
    coverLetterId,
    generateCoverLetter,
    router,status,isFetched
  ]);
  // Removed hasGeneratedRef.current from dependencies
  // Added data and all other used variables

  useEffect(() => {
    if (contentRef.current && generatedContent) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedContent]);

  const isGeneratedEmpty = isEmpty(generatedContent);
  const displayContent = isGeneratedEmpty
    ? data?.coverLetter
    : generatedContent;

  return (
    <div className="grid grid-cols-1">
      <div className="bg-slate-50 border-b border-slate-200 shadow-md rounded-xl flex flex-col items-center justify-between">
        <div className="flex w-full gap-3 items-center p-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-sm font-medium text-slate-500">
            Email content
          </span>
        </div>

        <div
          ref={contentRef}
          className="bg-white p-4 h-[500px] overflow-y-auto w-full"
        >
          {isGenerating && !generatedContent ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-sm">Generating your cover letter...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm">
              {displayContent}
              {isGenerating && (
                <span className="inline-block w-2 h-5 bg-blue-600 ml-1 animate-pulse"></span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 p-4 shadow-xl w-full">
            Error: {JSON.stringify(error)}
          </div>
        )}
      </div>
    </div>
  );
});

TemporaryEmailCompose.displayName = "TemporaryEmailCompose";
