"use client";
import React, { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { apiService } from "@/hooks/use-auth";
import { COLLECTIONS } from "@/lib/utils/constants";
import { EditableResume } from "../../(dashboard)/ai-apply/components/resume/EditableResume";
import { ProgressIndicator } from "../../(dashboard)/ai-apply/progress-indicator";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { resumeQueries } from "@/lib/queries/resume.queries";
import { userQueries } from "@/lib/queries/user.queries";
import { logEvent } from "@/lib/analytics";

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
  const { data: user } = useQuery(userQueries.detail());

  useEffect(() => {
    if (user?.firstName)
      logEvent(
        "Tailor Resume Page",
        "View Tailor Resume Page",
        `${user?.firstName} Viewed Tailor Resume Page`
      );
  }, [user?.firstName]);

  // const defaultResume = user?.dataSource?.find(
  //   (resume) => resume.id === user?.defaultDataSource
  // );

  // TODO: CHECK THE EXPIRY OF THE URL AND REFRESH IF NEEDED IN THE SERVER OR CLIENT

  const { data, status, isFetched } = useQuery(resumeQueries.detail(resumeId));
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
      {/* {defaultResume?.url ? (
        <div className="w-full h-[600px]">
          <iframe
            src={`${defaultResume.url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-0"
            title="Resume PDF"
          />
        </div>
      ) : ( */}
      <EditableResume
        data={shouldUseDbData ? data! : streamData}
        resumeId={resumeId}
        isStreaming={streamStatus.isComplete}
      />
      <div ref={resultsEndRef} className="" />
    </div>
  );
};
