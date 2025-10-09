"use client";
import React, { useEffect, useRef, useState } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { PreviewResume } from "./preview-resume-template";
// import GenerationStatus from "./GenerationStatus";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [pause, setPause] = useState(true);

  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL;

  const { streamData, streamStatus, startStream } = useResumeStream(
    backendUrl + "/new-resume-generation"
  );
  const { useCareerDoc } = useAuth();
  const { data } = useCareerDoc(documentId);
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
      {/* <GenerationStatus streamStatus={streamStatus} /> */}
      <PreviewResume
        data={shouldUseDbData ? data! : streamData}
        cancelTimeout={cancelTimeout}
        pause={pause}
      />
    </div>
  );
};
