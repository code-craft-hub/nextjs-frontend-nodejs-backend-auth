"use client";
import React, { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useResumeData } from "@/hooks/use-resume-data";
import { Resume } from "@/types";
import { COLLECTIONS } from "@/lib/utils/constants";
import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";

export const TailorResume = ({
  jobDescription,
  resumeId,
}: {
  jobDescription: string;
  resumeId: string;
}) => {
  const { user, useCareerDoc } = useAuth();
  const { data } = useCareerDoc<Resume>(resumeId, COLLECTIONS.RESUME);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const hasGeneratedRef = useRef(false);

  console.count("TAILOR RESUME RENDERED");

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
    if (user && jobDescription) {
      hasGeneratedRef.current = true;
      console.count("API CALLED")
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
  }, [user, jobDescription]);

  const shouldUseDbData = streamData.profile === "";
  return (
    <div className="">
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
