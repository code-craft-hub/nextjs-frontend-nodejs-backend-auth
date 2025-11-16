"use client";

import React, { useRef, useEffect, memo } from "react";
import { Loader2 } from "lucide-react";
import { useCoverLetterGenerator } from "@/hooks/useCoverLetterGenerator";
import { apiService } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { createCoverLetterOrderedParams } from "@/lib/utils/helpers";
import { toast } from "sonner";
import { isEmpty } from "lodash";
import { COLLECTIONS } from "@/lib/utils/constants";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";

export const TailorCoverLetter = memo<{
  jobDescription: string;
  coverLetterId: string;
  recruiterEmail: string;
  aiApply: boolean;
}>(({ jobDescription, coverLetterId, aiApply, recruiterEmail }) => {
  const { generatedContent, isGenerating, error, generateCoverLetter } =
    useCoverLetterGenerator();

  const contentRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false); // Track if we've already generated

  const { data: user } = useQuery(userQueries.detail());
  const { data, status, isFetched } = useQuery(
    coverLetterQueries.detail(coverLetterId)
  );

  const router = useRouter();
  useEffect(() => {
    const runGeneration = async () => {
      if (isFetched && status === "success") {
        if (user && jobDescription && !hasGeneratedRef.current && !data) {
          hasGeneratedRef.current = true;

          console.count("API CALLED");

          try {
            toast.promise(
              generateCoverLetter({ user, jobDescription, coverLetterId }),
              {
                loading: "Generating your tailored cover letter...",
                success: "Cover letter generation complete!",
                error: "Failed to generate cover letter",
              }
            );

            // ✅ Wait before navigating only after generation completes
            if (aiApply) {
              const orderedParams = createCoverLetterOrderedParams(
                coverLetterId,
                jobDescription
              );

              await new Promise((resolve) => setTimeout(resolve, 5000));

              if (user?.aiApplyPreferences?.useMasterCV) {
                router.push(
                  `/dashboard/preview?baseResume=${
                    user?.defaultDataSource
                  }?aiApply=true&recruiterEmail=${recruiterEmail}&${orderedParams.toString()}`
                );

                //           router.push(
                //   `/dashboard/preview?resumeId=${resumeId}&coverLetterId=${coverLetterId}&recruiterEmail=${recruiterEmail}&jobDescription=${jobDescription}`
                // );
                return;
              }
              router.push(
                `/dashboard/tailor-resume/${uuidv4()}?aiApply=true&recruiterEmail=${recruiterEmail}&${orderedParams.toString()}`
              );
            }
          } catch (err) {
            console.error("Error generating cover letter:", err);
          }
        }
      }
    };

    runGeneration();
  }, [
    user,
    jobDescription,
    data,
    status,
    isFetched,
    aiApply,
    coverLetterId,
    generateCoverLetter,
    router,
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

  const handleCoverLetterDelete = async () => {
    await apiService.deleteCareerDoc(coverLetterId, COLLECTIONS.COVER_LETTER);
    toast.success("Cover letter deleted successfully");
    router.push("/dashboard/home");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {aiApply && <ProgressIndicator activeStep={1} />}
      <div className="flex w-full gap-3 items-center  p-4  bg-white justify-between">
        <p className="text-xl font-medium font-inter">Tailored Cover Letter</p>
        <Button
          className="text-2xs"
          onClick={() => {
            handleCoverLetterDelete();
          }}
        >
          Delete
        </Button>
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
                  {data?.firstName ?? user?.firstName}{" "}
                  {data?.lastName ?? user?.lastName}{" "}
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
                    {data?.firstName ?? user?.firstName}{" "}
                    {data?.lastName ?? user?.lastName}
                  </p>
                  <p className="">{data?.phoneNumber ?? user?.phoneNumber}</p>
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
