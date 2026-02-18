"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { useCoverLetterStream } from "@/hooks/useCoverLetterGenerator";
import { useCreateAutoApplyMutation } from "@/lib/mutations/auto-apply.mutations";
import { userQueries } from "@module/user";
import { buildPreviewUrl } from "@/lib/utils/ai-apply-navigation";
import { invalidateDocumentGenerationQueries } from "@/lib/query/query-invalidation";
import { TailorCoverLetterDisplayStreaming } from "../tailor-cover-letter/TailorCoverLetterDisplayStreaming";
import { ResumeLoadingSkeleton } from "../tailor-resume/components/resume-loading-skeleton";
import { aiSettingsQueries } from "@/lib/queries/ai-settings.queries";


export default function AutoApplyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedRef = useRef(false);
  const hasSavedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const createAutoApply = useCreateAutoApplyMutation();

  // Extract parameters from URL
  const jobDescription = searchParams.get("jobDescription") || "";
  const recruiterEmail = searchParams.get("recruiterEmail") || "";

  // Get user data and settings (prefetched on server)
  const { data: user } = useQuery(userQueries.detail());
  const { data: settings } = useQuery(aiSettingsQueries.detail());

  const useMasterCv = settings?.useMasterCv && !!settings?.masterCvId;

  // Initialize cover letter and resume streams
  const { state: coverLetterState, start: startCoverLetter } =
    useCoverLetterStream();

  const {
    streamStatus: resumeStatus,
    startStream: startResume,
    documentId: resumeDocId,
  } = useResumeStream();

  // Start generations on first render
  useEffect(() => {
    if (jobDescription && user && !hasStartedRef.current) {
      hasStartedRef.current = true;

      if (useMasterCv) {
        // Only generate cover letter when using master CV
        toast.promise(startCoverLetter({ jobDescription }), {
          loading: "Generating cover letter...",
          success: "Cover letter generated!",
          error: "Failed to generate cover letter",
        });
      } else {
        // Generate both cover letter and resume in parallel
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
    }
  }, [jobDescription, user, startCoverLetter, startResume, useMasterCv]);

  // Navigate to preview once generation is complete
  useEffect(() => {
    const isCoverLetterComplete =
      coverLetterState.documentId && !coverLetterState.isStreaming;

    const isResumeComplete = useMasterCv
      ? true // No resume generation needed when using master CV
      : resumeStatus.isComplete && resumeDocId;

    if (isCoverLetterComplete && isResumeComplete && !hasSavedRef.current) {
      hasSavedRef.current = true;

      const finalResumeId = useMasterCv ? settings!.masterCvId! : resumeDocId!;

      createAutoApply.mutate(
        {
          id: crypto.randomUUID(),
          resumeId: finalResumeId,
          coverLetterId: coverLetterState.documentId,
          title: coverLetterState.title || "Auto Apply",
          type: "email",
          recruiterEmail: recruiterEmail || null,
          jobDescription: jobDescription || null,
          status: "draft",
          source: "auto_apply",
        },
        {
          onSettled: (data) => {
            console.log("[AutoApply] Auto apply record created:", data);
            const autoApplyId = data?.id;
            const previewUrl = buildPreviewUrl(
              autoApplyId,
              coverLetterState.documentId,
              finalResumeId,
              recruiterEmail,
              useMasterCv ? { masterCvId: settings!.masterCvId! } : undefined,
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
    useMasterCv,
    settings,
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
  const aiApply = true;

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <TailorCoverLetterDisplayStreaming
        aiApply={aiApply}
        state={coverLetterState}
        displayUser={displayUser}
        displayContent={displayContent}
        contentRef={contentRef as React.RefObject<HTMLDivElement>}
      />
      {!useMasterCv && <ResumeLoadingSkeleton />}
    </div>
  );
}
