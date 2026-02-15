"use client";

import { useEffect, useRef } from "react";
import { useCoverLetterStream } from "@/hooks/useCoverLetterGenerator";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/lib/queries/user.queries";
import { coverLetterQueries } from "@/lib/queries/cover-letter.queries";
import {
  buildCoverLetterUpdateUrl,
  buildResumeStartUrl,
  isPlaceholderId,
} from "@/lib/utils/ai-apply-navigation";
import { TailorCoverLetterDisplayStreaming } from "./TailorCoverLetterDisplayStreaming";
import { useFireworksConfetti } from "@/components/ui/confetti";

export default function TailorCoverLetter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { start: startConfetti } = useFireworksConfetti();

  const { state, start } = useCoverLetterStream();
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
      );
      router.replace(newUrl);
          startConfetti();

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
    firstName: existingCoverLetter?.firstName ?? user?.firstName ?? "",
    lastName: existingCoverLetter?.lastName ?? user?.lastName ?? "",
    phoneNumber: existingCoverLetter?.phoneNumber ?? user?.phoneNumber ?? "",
    title: existingCoverLetter?.title ?? state?.title ?? "",
  };

  return (
    <TailorCoverLetterDisplayStreaming
      aiApply={aiApply}
      state={state}
      displayUser={displayUser}
      displayContent={displayContent}
      contentRef={contentRef as React.RefObject<HTMLDivElement>}
    />
  );
}
