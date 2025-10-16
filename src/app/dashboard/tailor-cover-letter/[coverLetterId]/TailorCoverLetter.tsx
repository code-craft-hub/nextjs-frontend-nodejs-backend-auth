"use client";

import React, { useRef, useEffect, memo } from "react";
import { Loader2 } from "lucide-react";
import { useCoverLetterGenerator } from "@/hooks/useCoverLetterGenerator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { createCoverLetterOrderedParams } from "@/lib/utils/helpers";
import { toast } from "sonner";
import { isEmpty } from "lodash";
import { COLLECTIONS } from "@/lib/utils/constants";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { CoverLetterRequest } from "@/types";

export const TailorCoverLetter = memo<{
  jobDescription: string;
  coverLetterId: string;
  aiApply: boolean;
}>(({ jobDescription, coverLetterId, aiApply }) => {
  console.log("COVER LETTER ID : ", coverLetterId);
  console.count("TAILOR COVER LETTER RENDERED");

  const { generatedContent, isGenerating, error, generateCoverLetter } =
    useCoverLetterGenerator();

  const contentRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false); // Track if we've already generated

  const { user, useCareerDoc } = useAuth();
  const { data, isFetched, status } = useCareerDoc<CoverLetterRequest>(
    coverLetterId,
    COLLECTIONS.COVER_LETTER
  );
  const router = useRouter();

  useEffect(() => {
    console.log(user, jobDescription, hasGeneratedRef.current, data);

    if (isFetched && status === "success") {
      console.log("INSIDE IFF", status, isFetched);
      if (user && jobDescription && !hasGeneratedRef.current && !data) {
        hasGeneratedRef.current = true;

        console.count("API CALLED");
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
    router,
    status,
    isFetched,
  ]);

  // ✅ Auto-scroll to bottom when content changes
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
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      <div className="flex w-full gap-3 items-center  p-4 sm:px-8 bg-white justify-between">
        <p className="text-xl font-medium font-inter">Tailor Cover Letter</p>
        <Button>Delete</Button>
      </div>
      <div className="bg-slate-50 border-b  border-slate-200 shadow-md rounded-xl flex flex-col items-center justify-between">
        <div
          ref={contentRef}
          className="bg-white p-4 sm:p-8 h-[500px] overflow-y-auto w-full"
        >
          {isGenerating && !generatedContent ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-sm">Generating your cover letter...</p>
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-outfit text-md flex flex-col gap-2">
              <div className="mb-4">
                <p className="text-xl font-medium font-inter">
                  {data?.firstName} {data?.lastName}{" "}
                </p>
                <p className="text-sm font-inter">{data?.title}</p>
              </div>
              <p className="text-sm font-bold font-inter">
                Dear Hiring Manager,
              </p>
              <p className="text-sm">{displayContent}</p>
              {displayContent && (
                <div className="mt-8">
                  <p className="">Sincerely</p>
                  <p className="">
                    {data?.firstName} {data?.lastName}
                  </p>
                  <p className="">{data?.phoneNumber}</p>
                </div>
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

TailorCoverLetter.displayName = "TailorCoverLetter";
