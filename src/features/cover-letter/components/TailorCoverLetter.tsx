"use client";

import { useEffect, useRef, useState } from "react";
import { useCoverLetterStream } from "@/features/cover-letter/hooks/useCoverLetterGenerator";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@features/user";
import { coverLetterQueries } from "@/features/cover-letter/queries/cover-letter.queries";
import {
  buildCoverLetterUpdateUrl,
  isPlaceholderId,
} from "@/lib/utils/ai-apply-navigation";
import { TailorCoverLetterDisplayStreaming } from "./TailorCoverLetterDisplayStreaming";
import { TailorCoverLetterEditForm } from "./TailorCoverLetterEditForm";
import { useFireworksConfetti } from "@/components/ui/confetti";

export default function TailorCoverLetter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { start: startConfetti } = useFireworksConfetti();
  const [isEditing, setIsEditing] = useState(false);

  const { state, start } = useCoverLetterStream();
  const { data: user } = useQuery(userQueries.detail());

  // Extract IDs and parameters from URL search params
  const coverLetterId = searchParams.get("coverLetterId");
  const jobDescription = searchParams.get("jobDescription") || "";
  const recruiterEmail = searchParams.get("recruiterEmail") || "";
  const aiApply = searchParams.get("aiApply") === "true";
  const isGeneratorStep = isPlaceholderId(coverLetterId);

  // Fetch existing cover letter if documentId is present (reload case)
  const { data: existingCoverLetter } = useQuery(
    coverLetterQueries.detail(coverLetterId ?? ""),
  );

  const isGenerated = !!coverLetterId && !!existingCoverLetter;

  // Auto-start generation on first visit (no coverLetterId means fresh generation)
  useEffect(() => {
    if (isGeneratorStep && jobDescription && !hasStartedRef.current) {
      hasStartedRef.current = true;
      start({ jobDescription });
    }
  }, [isGeneratorStep, jobDescription, start]);

  // After generation completes, update URL with actual documentId
  useEffect(() => {
    if (state.documentId && !state.isStreaming && isGeneratorStep) {
      const newUrl = buildCoverLetterUpdateUrl(state.documentId);
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

  // Auto-scroll to bottom when streaming content changes
  useEffect(() => {
    if (contentRef.current && state.content) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [state.content]);

  const displayContent = isGenerated
    ? existingCoverLetter?.content
    : state.content;

  const displayUser = {
    firstName: existingCoverLetter?.firstName ?? user?.firstName ?? "",
    lastName: existingCoverLetter?.lastName ?? user?.lastName ?? "",
    phoneNumber: existingCoverLetter?.phoneNumber ?? user?.phoneNumber ?? "",
    title: existingCoverLetter?.title ?? state?.title ?? "",
  };

  if (isEditing && existingCoverLetter) {
    return (
      <TailorCoverLetterEditForm
        coverLetter={existingCoverLetter}
        user={user}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <TailorCoverLetterDisplayStreaming
      aiApply={aiApply}
      state={state}
      displayUser={displayUser}
      displayContent={displayContent}
      contentRef={contentRef as React.RefObject<HTMLDivElement>}
      onEdit={existingCoverLetter ? () => setIsEditing(true) : undefined}
    />
  );
}
