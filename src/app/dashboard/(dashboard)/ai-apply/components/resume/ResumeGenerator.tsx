"use client";
import { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { EditableResume } from "./EditableResume";
import { COLLECTIONS } from "@/lib/utils/constants";
import { baseURL } from "@/lib/api/client";

// const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
export const ResumeGenerator = ({
  jobDescription,
  resumeId,
}: {
  jobDescription: string;
  resumeId: string;
}) => {

  const { streamData, streamStatus, startStream } = useResumeStream(
    baseURL + "/new-resume-generation",
    resumeId
  );
  const { user, useCareerDoc } = useAuth();
  const {
    data: existingResume,
    isFetched,
    status,
  } = useCareerDoc<any>(resumeId, COLLECTIONS.RESUME);
  // const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resultsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streamStatus.isComplete) {
      resultsEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [streamData]);

  // const cancelTimeout = () => {
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //   }
  // };


  useEffect(() => {
    if (isFetched && status === "success") {
      if (user && jobDescription && !existingResume) {
        // hasGeneratedRef.current = true;
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
  }, [user, jobDescription, existingResume, isFetched, status]);

  const resumeData = existingResume || streamData;

  return (
    <div className="py-4 sm:py-8">
      {/* Resume Id {resumeId}
      <br />
      */}
      {/* Status: {streamStatus.isConnected ? "Connected" : "Disconnected"} |{" "}
      isStreaming: {streamStatus.isComplete ? "Complete" : "In Progress"} */}
      <EditableResume
        data={resumeData}
        // cancelTimeout={cancelTimeout}
        resumeId={resumeId}
        isStreaming={streamStatus.isComplete}
      />
      <div ref={resultsEndRef} className="" />
    </div>
  );
};