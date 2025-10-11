"use client";
import React, { useEffect, useRef, useState } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { EditableResume } from "./EditableResume";
import { useResumeData } from "@/hooks/use-resume-data";
import { Resume } from "@/types";

export const ResumeGenerator = ({
  handleStepChange,
  userProfile,
  jobDescription,
  documentId,
}: {
  handleStepChange: (
    step: number,
    key: "resume" | "emailContent",
    value: any
  ) => void;
  userProfile: string;
  jobDescription: string;
  documentId: string;
}) => {
  const { useCareerDoc } = useAuth();
  const { data } = useCareerDoc<Resume>(documentId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { resumeData, updateField } = useResumeData(data || {}, {
    documentId,
    onSuccess: (field) => {
      console.log(`✓ Successfully updated ${field}`);
    },
    onError: (error, field) => {
      console.error(`✗ Failed to update ${field}:`, error);
    },
  });

  const [pause, setPause] = useState(true);

  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL;

  const { streamData, streamStatus, startStream } = useResumeStream(
    backendUrl + "/new-resume-generation"
  );
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const oldDescription = params.get("jobDescription");

  useEffect(() => {
    if (userProfile && jobDescription && !documentId) {
      startStream(userProfile, jobDescription);
    }
  }, [userProfile, jobDescription]);

  useEffect(() => {
    console.log(streamStatus);
    if (streamStatus.savedDocumentToDatabase) {
      console.log("Status", streamStatus, streamData.documentId);
      params.delete("jobDescription");
      params.delete("documentId");
      params.append("documentId", streamData.documentId);
      params.append("jobDescription", oldDescription!.toString());
      router.replace(`${frontendUrl}/dashboard/ai-apply?${params.toString()}`);
      toast.success(
        "Resume generation complete! Proceeding to next step in the next 5 seconds..."
      );

      timeoutRef.current = setTimeout(() => {
        handleStepChange(3, "resume", streamData);
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [streamStatus.savedDocumentToDatabase]);

  const cancelTimeout = () => {
    if (timeoutRef.current) {
      setPause(true);
      clearTimeout(timeoutRef.current);
    }
  };

  const shouldUseDbData = streamData.profile === "";
  return (
    <div className="">
      <EditableResume
        data={shouldUseDbData ? resumeData : streamData}
        cancelTimeout={cancelTimeout}
        pause={pause}
        onUpdate={updateField}
      />
    </div>
  );
};
