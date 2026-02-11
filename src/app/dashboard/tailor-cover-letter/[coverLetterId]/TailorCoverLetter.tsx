"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useCoverLetterStream } from "@/hooks/useCoverLetterGenerator";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import { createCoverLetterOrderedParams } from "@/lib/utils/helpers";
import { v4 as uuidv4 } from "uuid";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";

interface TailorCoverLetterProps {
  jobDescription: string;
  coverLetterId: string;
  aiApply: boolean;
  recruiterEmail: string;
  documentId?: string;
}

export default function TailorCoverLetter({
  jobDescription,
  aiApply,
  recruiterEmail,
  documentId,
}: TailorCoverLetterProps) {
  console.log({ jobDescription, aiApply, recruiterEmail, documentId });
  const router = useRouter();
  const pathname = usePathname();
  const hasStartedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { state, start, stop } = useCoverLetterStream();
  const { data: user } = useQuery(userQueries.detail());

  // Fetch existing cover letter if documentId is present (reload case)
  const { data: existingCoverLetter } = useQuery(
    coverLetterQueries.detail(documentId ?? ""),
  );

  console.log({ existingCoverLetter });

  const isGenerated = !!documentId && !!existingCoverLetter;

  // Auto-start generation on first visit (no documentId means fresh generation)
  useEffect(() => {
    if (!documentId && jobDescription && !hasStartedRef.current) {
      hasStartedRef.current = true;
      start({ jobDescription });
    }
  }, [documentId, jobDescription, start]);

  // After generation completes, append documentId to URL
  useEffect(() => {
    if (state.documentId && !state.isStreaming) {
      const params = new URLSearchParams();
      params.set("documentId", state.documentId);
      if (jobDescription) params.set("jobDescription", jobDescription);
      if (aiApply) params.set("aiApply", "true");
      if (recruiterEmail) params.set("recruiterEmail", recruiterEmail);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [
    state.documentId,
    state.isStreaming,
    pathname,
    jobDescription,
    aiApply,
    recruiterEmail,
    router,
  ]);

  // Handle aiApply navigation after generation completes
  useEffect(() => {
    if (!aiApply || !state.documentId || state.isStreaming) return;

    const orderedParams = createCoverLetterOrderedParams(
      state.documentId,
      jobDescription,
    );

    const timeout = setTimeout(() => {
      if (user?.aiApplyPreferences?.useMasterCV) {
        router.push(
          `/dashboard/preview?baseResume=${user?.defaultDataSource}?aiApply=true&recruiterEmail=${recruiterEmail}&${orderedParams.toString()}`,
        );
      } else {
        router.push(
          `/dashboard/tailor-resume/${uuidv4()}?aiApply=true&recruiterEmail=${recruiterEmail}&${orderedParams.toString()}`,
        );
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [
    aiApply,
    state.documentId,
    state.isStreaming,
    user,
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
