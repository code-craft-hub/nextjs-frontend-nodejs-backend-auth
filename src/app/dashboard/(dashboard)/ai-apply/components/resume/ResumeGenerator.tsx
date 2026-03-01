"use client";
import { useEffect, useRef } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@module/user";
import { EditableResume } from "./EditableResume";

// const backendUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
export const ResumeGenerator = ({
  jobDescription,
  resumeId,
}: {
  jobDescription: string;
  resumeId: string;
}) => {
  const { streamData, streamStatus, startStream } = useResumeStream();
  const { data: user } = useQuery(userQueries.detail());

  // existingResume is not fetched via Firestore anymore; always generate
  const existingResume = null;
  const isFetched = true;
  const status = "success";

  const resultsEndRef = useRef<HTMLDivElement>(null);

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
      if (user && jobDescription && !existingResume) {
        toast.promise(startStream(jobDescription), {
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
      <EditableResume
        data={resumeData}
        resumeId={resumeId}
        isStreaming={streamStatus.isComplete}
      />
      <div ref={resultsEndRef} className="" />
    </div>
  );
};
