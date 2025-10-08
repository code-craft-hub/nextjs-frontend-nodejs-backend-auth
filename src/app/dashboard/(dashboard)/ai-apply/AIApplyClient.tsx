"use client";
import React, { useState } from "react";
import { ProgressIndicator } from "./progress-indicator";
import { ResumeGenerator } from "./components/resume-generator";
import { EmailComposer } from "./components/email-composer";
import { DisplayResumeEmailContent } from "./components/display-resume-emailcontent";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export const AIApplyClient = ({
  jobDescription,documentId
}: {
  jobDescription: string;
  documentId: string;
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const { user } = useAuth();
  const handleStepChange = (
    step: number,
    key: "resume" | "emailContent",
    value: any
  ) => {
    // setActiveStep(step);
    setGeneratedData((prev) => ({ ...prev, [key]: value }));
  };
  const [generatedData, setGeneratedData] = useState({
    resume: {},
    emailContent: "",
  });

  const router = useRouter();

  if (activeStep === 3) {
    router.push("/dashboard/home");
  }
  return (
    <div>
      <ProgressIndicator
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
      <div className="">
        {/* {activeStep === 0 && (
          <ResumeGenerator
            handleStepChange={handleStepChange}
            userProfile={user?.baseResume ?? ""}
            jobDescription={jobDescription}
            documentId={documentId}
          />
       )}
         {activeStep === 1 && (
          
        )} */}
        <EmailComposer
            handleStepChange={handleStepChange}
            userProfile={user?.baseResume ?? ""}
            jobDescription={jobDescription}
          />
        {/*{activeStep === 2 && (
          <DisplayResumeEmailContent generatedData={generatedData} />
        )} */}
      </div>
    </div>
  );
};
