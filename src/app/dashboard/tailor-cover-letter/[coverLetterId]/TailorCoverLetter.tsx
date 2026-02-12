"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useCoverLetterStream } from "@/hooks/useCoverLetterGenerator";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";
import {
  buildCoverLetterUpdateUrl,
  buildResumeStartUrl,
  isPlaceholderId,
} from "@/lib/utils/ai-apply-navigation";

export default function TailorCoverLetter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { state, start, stop } = useCoverLetterStream();
  const { data: user } = useQuery(userQueries.detail());

  // Extract IDs and parameters from URL search params
  const coverLetterDocId = searchParams.get("coverLetterDocId");
  const jobDescription = searchParams.get("jobDescription") || "";
  const recruiterEmail = searchParams.get("recruiterEmail") || "";
  const aiApply = searchParams.get("aiApply") === "true";
  const isGeneratorStep = isPlaceholderId(coverLetterDocId);

  // Fetch existing cover letter if documentId is present (reload case)
  const { data: existingCoverLetter } = useQuery(
    coverLetterQueries.detail(coverLetterDocId ?? ""),
  );

  const isGenerated = !!coverLetterDocId && !!existingCoverLetter;

  // Auto-start generation on first visit (no coverLetterDocId means fresh generation)
  useEffect(() => {
    if (isGeneratorStep && jobDescription && !hasStartedRef.current) {
      hasStartedRef.current = true;
      start({ jobDescription });
    }
  }, [isGeneratorStep, jobDescription, start]);

  // After generation completes, update URL with actual documentId
  useEffect(() => {
    if (state.documentId && !state.isStreaming && isGeneratorStep) {
      const newUrl = buildCoverLetterUpdateUrl(
        state.documentId,
        jobDescription,
        recruiterEmail,
      );
      router.replace(newUrl);
    }
  }, [
    state.documentId,
    state.isStreaming,
    isGeneratorStep,
    jobDescription,
    recruiterEmail,
    router,
  ]);

  // Handle aiApply navigation after generation completes
  useEffect(() => {
    if (
      !aiApply ||
      !state.documentId ||
      state.isStreaming ||
      !isGeneratorStep
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      if (user?.aiApplyPreferences?.useMasterCV) {
        // Use master CV directly (no resume generation needed)
        router.push(
          `/dashboard/preview?coverLetterDocId=${state.documentId}&baseResume=${user?.defaultDataSource}&aiApply=true&recruiterEmail=${recruiterEmail}&jobDescription=${encodeURIComponent(jobDescription)}`,
        );
      } else {
        // Navigate to tailor resume with the generated cover letter ID
        const resumeUrl = buildResumeStartUrl(
          state.documentId,
          jobDescription,
          recruiterEmail,
        );
        router.push(resumeUrl);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [
    aiApply,
    state.documentId,
    state.isStreaming,
    isGeneratorStep,
    user?.aiApplyPreferences?.useMasterCV,
    user?.defaultDataSource,
    jobDescription,
    recruiterEmail,
    router,
  ]);

  // Auto-scroll to bottom when streaming content changes
  useEffect(() => {
    if (contentRef.current && state.content) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [state.content]);

  const displayContent = isGenerated
    ? existingCoverLetter?.content || existingCoverLetter?.coverLetter
    : state.content;

  const displayUser = {
    firstName: existingCoverLetter?.firstName ?? user?.firstName,
    lastName: existingCoverLetter?.lastName ?? user?.lastName,
    phoneNumber: existingCoverLetter?.phoneNumber ?? user?.phoneNumber,
    title: existingCoverLetter?.title ?? state?.title,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {aiApply && <ProgressIndicator activeStep={1} />}
      <div className="flex w-full gap-3 items-center p-4 bg-white justify-between">
        <p className="text-xl font-medium font-inter">Tailored Cover Letter</p>
      </div>

      <div className="bg-slate-50 border-b border-slate-200 shadow-md rounded-xl flex flex-col items-center justify-between">
        <div
          ref={contentRef}
          className="bg-white p-4 sm:p-8 h-125 overflow-y-auto w-full"
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

        {state.isStreaming && (
          <div className="p-4 w-full flex justify-center">
            <button
              onClick={stop}
              className="text-sm text-red-500 hover:underline"
            >
              Stop generating
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
