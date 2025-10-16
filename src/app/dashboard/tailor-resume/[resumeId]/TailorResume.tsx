"use client";
import React, { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useResumeData } from "@/hooks/use-resume-data";
import { Resume } from "@/types";
import { COLLECTIONS } from "@/lib/utils/constants";
import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";

export const TailorResume = ({
  jobDescription,
  resumeId,
  aiApply,
}: {
  jobDescription: string;
  resumeId: string;
  aiApply: boolean;
}) => {
  const { user, useCareerDoc } = useAuth();
  const { data, status, isFetched } = useCareerDoc<Resume>(
    resumeId,
    COLLECTIONS.RESUME
  );
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);

  // console.count("TAILOR RESUME RENDERED");

  const { resumeData, updateField } = useResumeData(data || {}, {
    resumeId,
    onSuccess: (field) => {
      console.log(`✓ Successfully updated ${field}`);
    },
    onError: (error, field) => {
      console.error(`✗ Failed to update ${field}:`, error);
    },
  });

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
  }, [user, jobDescription, data, status, isFetched, aiApply]);

  const shouldUseDbData = streamData.profile === "";
  return (
    <div className="space-y-4 sm:space-y-8">
      {aiApply && <ProgressIndicator activeStep={2} />}
      <EditableResume
        data={shouldUseDbData ? resumeData : streamData}
        onUpdate={updateField}
        cancelTimeout={() => {}}
        resumeId={resumeId}
        isStreaming={streamStatus.isComplete}
      />
      <div ref={resultsEndRef} className="" />
    </div>
  );
};
