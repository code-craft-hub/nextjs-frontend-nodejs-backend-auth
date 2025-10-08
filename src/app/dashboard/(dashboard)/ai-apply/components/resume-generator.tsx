"use client";
import React, { useEffect } from "react";
import { useResumeStream } from "@/hooks/stream-resume-hook";
import { toast } from "sonner";
import { PreviewResume } from "./preview-resume-template";
import {
  processCertifications,
  processEducation,
  processProjects,
  processSkills,
  processWorkExperience,
} from "@/lib/utils/helpers";

export const ResumeGenerator = ({
  handleStepChange,
  userProfile,
  jobDescription,
}: {
  handleStepChange: (
    step: number,
    key: "resume" | "emailContent",
    value: any
  ) => void;
  userProfile: string;
  jobDescription: string;
}) => {
  const endpoint =
    process.env.NEXT_PUBLIC_AUTH_API_URL + "/new-resume-generation";
  const { streamData, streamStatus, startStream } = useResumeStream(endpoint);

  useEffect(() => {
    if (userProfile && jobDescription) {
      startStream(userProfile, jobDescription);
    }
  }, [userProfile, jobDescription]);

  useEffect(() => {
    if (streamStatus.completedSections.size === 6) {
      toast.success(
        "Resume generation complete! Proceeding to next step in the next 5 seconds..."
      );
      const streamedData = {
        profile: streamData.profile,
        education,
        softSkill,
        hardSkill,
        certification,
        project,
        workExperience,
      };
      setTimeout(() => {
        handleStepChange(1, "resume", streamedData);
      }, 5000);
    }
  }, [streamStatus.completedSections.size]);

  const workExperience = processWorkExperience(streamData.workExperience);
  const education = processEducation(streamData.education);
  const softSkill = processSkills(streamData.softSkill);
  const hardSkill = processSkills(streamData.hardSkill);
  const certification = processCertifications(streamData.certification);
  const project = processProjects(streamData.project);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 p-3 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              streamStatus.isConnected
                ? "bg-green-500"
                : streamStatus.isComplete
                ? "bg-blue-500"
                : "bg-gray-400"
            }`}
          ></span>
          <span>
            {streamStatus.isConnected
              ? "Generating resume..."
              : streamStatus.isComplete
              ? "Resume generated!"
              : "Ready to generate"}
          </span>
          {streamStatus.completedSections.size > 0 && (
            <span className="">
              ({streamStatus.completedSections.size}/6 sections complete)
            </span>
          )}
        </div>
        {streamStatus.error && (
          <div className="mt-2 text-red-600 text-sm">
            Error: {streamStatus.error}
          </div>
        )}
      </div>
      <PreviewResume data={streamData} />
      <pre className="grid grid-cols-1 max-w-xl">
        {JSON.stringify(streamData, null, 2)}
      </pre>
    </div>
  );
};
