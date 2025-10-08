"use client";
import React, { useEffect } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { PreviewResume } from "./preview-resume-template";
import GenerationStatus from "./GenerationStatus";
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
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL;

  const { streamData, streamStatus, startStream } = useResumeStream(
    backendUrl + "/new-resume-generation"
  );
  const { useCareerDoc } = useAuth();
  const { data } = useCareerDoc(documentId);
  console.log("Data from database : ", data);
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const oldDescription = params.get("jobDescription");
  console.log(
    "All values for 'jobDescription':",
    params.getAll("jobDescription")
  );
  console.log("All entries:", [...params.entries()]);

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

      setTimeout(() => {
        handleStepChange(1, "resume", streamData);
      }, 5000);
    }
  }, [streamStatus.savedDocumentToDatabase]);

  console.log("DATA : =============   :", streamData, data);

  const shouldUseDbData = streamData.profile === "";
  return (
    <div className="max-w-4xl mx-auto p-6">
      <GenerationStatus streamStatus={streamStatus} />
      <PreviewResume data={shouldUseDbData ? data! : streamData} />
    </div>
  );
};
