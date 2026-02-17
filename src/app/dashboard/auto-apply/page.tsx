"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { useCoverLetterStream } from "@/hooks/useCoverLetterGenerator";
import { useCreateAutoApplyMutation } from "@/lib/mutations/auto-apply.mutations";
import { userQueries } from "@/lib/queries/user.queries";
import { BASEURL } from "@/lib/api/client";
import { BACKEND_API_VERSION } from "@/lib/api/profile.api";
import { buildPreviewUrl } from "@/lib/utils/ai-apply-navigation";
import { invalidateDocumentGenerationQueries } from "@/lib/query/query-invalidation";
import { TailorCoverLetterDisplayStreaming } from "../tailor-cover-letter/TailorCoverLetterDisplayStreaming";
import { ResumeLoadingSkeleton } from "../tailor-resume/components/resume-loading-skeleton";

const RESUME_API_URL = `${BASEURL}/${BACKEND_API_VERSION}/resumes/stream`;

export default function AutoApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedRef = useRef(false);
  const hasSavedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const createAutoApply = useCreateAutoApplyMutation();

  // Extract parameters from URL
  const jobDescription = searchParams.get("jobDescription") || "";
  const recruiterEmail = searchParams.get("recruiterEmail") || "";

  // Get user data
  const { data: user } = useQuery(userQueries.detail());

  // Initialize cover letter and resume streams
  const { state: coverLetterState, start: startCoverLetter } =
    useCoverLetterStream();

  const {
    streamStatus: resumeStatus,
    startStream: startResume,
    documentId: resumeDocId,
  } = useResumeStream(RESUME_API_URL);

  // Start both generations in parallel on first render
  useEffect(() => {
    if (jobDescription && user && !hasStartedRef.current) {
      hasStartedRef.current = true;

      // Start both in parallel
      Promise.all([
        toast.promise(startCoverLetter({ jobDescription }), {
          loading: "Generating cover letter...",
          success: "Cover letter generated!",
          error: "Failed to generate cover letter",
        }),
        toast.promise(startResume(user, jobDescription), {
          loading: "Generating resume...",
          success: "Resume generated!",
          error: "Failed to generate resume",
        }),
      ]).catch((error) => {
        console.error("[AutoApply] Generation error:", error);
      });
    }
  }, [jobDescription, user, startCoverLetter, startResume]);

  // Navigate to preview once both are complete
  useEffect(() => {
    const isCoverLetterComplete =
      coverLetterState.documentId && !coverLetterState.isStreaming;
    const isResumeComplete = resumeStatus.isComplete && resumeDocId;

    if (isCoverLetterComplete && isResumeComplete && !hasSavedRef.current) {
      hasSavedRef.current = true;

      createAutoApply.mutate(
        {
          id: crypto.randomUUID(),
          resumeId: resumeDocId,
          coverLetterId: coverLetterState.documentId,
          title: coverLetterState.title || "Auto Apply",
          type: "email",
          recruiterEmail: recruiterEmail || null,
          jobDescription: jobDescription || null,
          status: "draft",
          source: "auto_apply",
        },
        {
          onSettled: () => {
            const previewUrl = buildPreviewUrl(
              coverLetterState.documentId,
              resumeDocId,
              recruiterEmail,
            );
            router.push(previewUrl);
            invalidateDocumentGenerationQueries();
          },
        },
      );
    }
  }, [
    coverLetterState.documentId,
    coverLetterState.isStreaming,
    resumeStatus.isComplete,
    resumeDocId,
    jobDescription,
    recruiterEmail,
    router,
  ]);

  // Auto-scroll to bottom when streaming content changes
  useEffect(() => {
    if (contentRef.current && coverLetterState.content) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [coverLetterState.content]);

  const displayUser = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    title: coverLetterState.title || "",
  };

  const displayContent = coverLetterState.content;
  const aiApply = true; // Auto-apply is always true on this page

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <TailorCoverLetterDisplayStreaming
        aiApply={aiApply}
        state={coverLetterState}
        displayUser={displayUser}
        displayContent={displayContent}
        contentRef={contentRef as React.RefObject<HTMLDivElement>}
      />
      <ResumeLoadingSkeleton />
    </div>
  );
}
