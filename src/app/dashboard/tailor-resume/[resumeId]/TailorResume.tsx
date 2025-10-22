"use client";
import React, { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { apiService, useAuth } from "@/hooks/use-auth";
import { Resume } from "@/types";
import { COLLECTIONS } from "@/lib/utils/constants";
import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const TailorResume = ({
  jobDescription,
  resumeId,
  coverLetterId,
  aiApply,
  recruiterEmail,
}: {
  jobDescription: string;
  resumeId: string;
  coverLetterId: string;
  aiApply: boolean;
  recruiterEmail: string;
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
        `/dashboard/preview?resumeId=${resumeId}&coverLetterId=${coverLetterId}&recruiterEmail=${recruiterEmail}&jobDescription=${jobDescription}`
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

  const handleCoverLetterDelete = async () => {
    await apiService.deleteCareerDoc(resumeId, COLLECTIONS.RESUME);
    toast.success("Resume deleted successfully");
    router.push("/dashboard/home");
  };
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* {JSON.stringify(streamStatus)}
      {streamStatus.isComplete ? (
        <div> streaming isComplete is True</div>
      ) : (
        <div>streaming isComplete is False</div>
      )}
      {streamStatus.isConnected ? (
        <div> streaming isConnected is True</div>
      ) : (
        <div>streaming isConnected is False</div>
      )} */}
      {aiApply && <ProgressIndicator activeStep={2} />}
      <div className="flex w-full gap-3 items-center  p-4  bg-white justify-between">
        <p className="text-xl font-medium font-inter">Tailored Resume</p>
        <Button
          className="text-2xs"
          onClick={() => {
            handleCoverLetterDelete();
          }}
        >
          Delete
        </Button>
      </div>
      <EditableResume
        data={shouldUseDbData ? data! : streamData}
        resumeId={resumeId}
        isStreaming={streamStatus.isComplete}
      />
      <div ref={resultsEndRef} className="" />
    </div>
  );
};
