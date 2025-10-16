"use client";
import React, { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Resume } from "@/types";
import { COLLECTIONS } from "@/lib/utils/constants";
import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";
import { useRouter } from "next/navigation";

export const TailorResume = ({
  jobDescription,
  resumeId,
  coverLetterId,
  aiApply,
}: {
  jobDescription: string;
  resumeId: string;
  coverLetterId: string;
  aiApply: boolean;
}) => {
  const { user, useCareerDoc } = useAuth();
  const { data, status, isFetched } = useCareerDoc<Resume>(
    resumeId,
    COLLECTIONS.RESUME
  );
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;

  const { streamData, streamStatus, startStream } = useResumeStream(
    backendUrl + "/new-resume-generation",
    resumeId
  );

  useEffect(() => {
    if (!streamStatus.isComplete) {
      resultsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [streamData]);

  useEffect(() => {
    if (isFetched && status === "success") {
      if (user && jobDescription && !data && !hasGeneratedRef.current) {
        hasGeneratedRef.current = true;
        console.count("API CALLED");
        toast.promise(startStream(user, jobDescription), {
          loading: "Generating your tailored resume...",
          success: () => {
            return {
              message: `Resume generation complete!`,
            };
          },
          error: "Error",
        });

      }
    }
    if (aiApply && streamStatus.isComplete) {
      router.push(
        `/dashboard/preview?resumeId=${resumeId}&coverLetterId=${coverLetterId}`
      );
    }
  }, [
    user,
    jobDescription,
    data,
    status,
    isFetched,
    aiApply,
    streamStatus.isComplete,
  ]);

  const shouldUseDbData = streamData.profile === "";
  return (
    <div className="space-y-4 sm:space-y-8">
      {JSON.stringify(streamStatus)}
      {streamStatus.isComplete ? <div> streaming isComplete is True</div> : <div>streaming isComplete is False</div>}
      {streamStatus.isConnected ? <div> streaming isConnected is True</div> : <div>streaming isConnected is False</div>}
      {aiApply && <ProgressIndicator activeStep={2} />}
      <EditableResume
        data={shouldUseDbData ? data! : streamData}
        resumeId={resumeId}
        isStreaming={streamStatus.isComplete}
      />
      <div ref={resultsEndRef} className="" />
    </div>
  );
};
